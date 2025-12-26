import Resume from '../models/Resume.js';
import { incrementUsage } from './usageService.js';
import { deleteFile, getFileUrl } from '../middleware/upload.js';
import aiServiceClient from './aiServiceClient.js';
import logger from '../utils/logger.js';
import axios from 'axios';
import fs from 'fs';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

class ResumeService {
  /**
   * Upload and create resume record
   */
  async uploadResume(file, userId, tenantId, jobId = null) {
    try {
      const resume = new Resume({
        tenantId,
        jobId,
        uploadedBy: userId,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        filePath: file.path,
        fileUrl: getFileUrl(null, file.filename),
        parsingStatus: 'pending'
      });

      await resume.save();

      // Record usage
      await incrementUsage(tenantId, 'resumesProcessed');

      // Trigger parsing asynchronously (don't wait for it)
      this.parseResumeAsync(resume._id).catch(err => {
        console.error('Error parsing resume:', err);
      });

      return resume;
    } catch (error) {
      // Clean up file if database save fails
      if (file.path) {
        await deleteFile(file.path).catch(console.error);
      }
      throw new Error(`Failed to upload resume: ${error.message}`);
    }
  }

  /**
   * Upload multiple resumes
   */
  async uploadMultipleResumes(files, userId, tenantId, jobId = null) {
    const results = {
      successful: [],
      failed: []
    };

    for (const file of files) {
      try {
        const resume = await this.uploadResume(file, userId, tenantId, jobId);
        results.successful.push(resume);
      } catch (error) {
        results.failed.push({
          fileName: file.originalname,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Parse resume using AI service (async)
   */
  async parseResumeAsync(resumeId) {
    try {
      const resume = await Resume.findById(resumeId);
      if (!resume) {
        throw new Error('Resume not found');
      }

      // Update status to processing
      resume.parsingStatus = 'processing';
      await resume.save();

      // Determine file type
      const fileExt = resume.fileName.split('.').pop().toLowerCase();
      const fileType = fileExt === 'docx' ? 'docx' : 'pdf';

      // Call AI service to parse resume
      const parseResponse = await aiServiceClient.parseResume(resume.filePath, fileType);
      
      if (!parseResponse.success) {
        throw new Error(parseResponse.error || 'Parsing failed');
      }

      const parsedData = parseResponse.resume;

      // Log parsed data for debugging
      console.log('📋 Parsed Resume Data:', {
        name: parsedData.name,
        email: parsedData.email,
        phone: parsedData.phone,
        skillsCount: parsedData.skills?.length || 0,
        experienceCount: parsedData.experience?.length || 0,
        educationCount: parsedData.education?.length || 0,
        sectionsFound: parsedData.sections_found,
        hasRawText: !!parsedData.raw_text
      });

      // Update resume with parsed data
      resume.rawText = parsedData.raw_text || '';
      resume.personalInfo = {
        fullName: parsedData.name || 'Not found',
        email: parsedData.email || '',
        phone: parsedData.phone || '',
        location: parsedData.location || '',
        summary: parsedData.summary || ''
      };

      // Extract skills by category
      const skills = parsedData.skills || [];
      resume.skills = {
        technical: skills.filter(s => s.category === 'programming' || s.category === 'technical' || s.category === 'web' || s.category === 'database').map(s => s.name),
        soft: skills.filter(s => s.category === 'soft_skills').map(s => s.name),
        languages: parsedData.languages || [],
        tools: skills.filter(s => s.category === 'tools' || s.category === 'cloud').map(s => s.name),
        certifications: parsedData.certifications || []
      };

      // Map experience
      resume.experience = (parsedData.experience || []).map(exp => ({
        title: exp.title || '',
        company: exp.company || '',
        startDate: exp.start_date || '',
        endDate: exp.end_date || '',
        description: exp.description || '',
        duration: exp.duration || ''
      }));

      // Map education
      resume.education = (parsedData.education || []).map(edu => ({
        degree: edu.degree || '',
        institution: edu.institution || '',
        field: edu.field || '',
        year: edu.year || '',
        gpa: edu.gpa || ''
      }));

      resume.projects = [];
      resume.certifications = parsedData.certifications || [];
      
      // Calculate ATS Score based on Job Description (if available) or Resume Quality
      let jobDescription = null;
      if (resume.jobId) {
        try {
          const Job = (await import('../models/Job.js')).default;
          const job = await Job.findById(resume.jobId);
          if (job) {
            // Combine required and preferred skills
            const allSkills = [
              ...(job.skills?.required || []),
              ...(job.skills?.preferred || [])
            ];
            
            jobDescription = {
              title: job.title,
              description: job.description,
              requirements: job.responsibilities?.join(' ') || '',
              skills: allSkills
            };
          }
        } catch (err) {
          console.log('Could not fetch job for ATS scoring:', err.message);
        }
      }
      
      const atsScore = this.calculateATSScore(resume, parsedData, jobDescription);
      resume.atsScore = atsScore.total;
      resume.atsDetails = atsScore.details;
      
      // Log ATS calculation results
      console.log('📊 ATS Score Calculated:', {
        total: atsScore.total,
        details: atsScore.details,
        hasJobDescription: !!jobDescription,
        sectionsFound: parsedData.sections_found
      });
      
      resume.parsingStatus = 'completed';
      resume.parsedAt = new Date();
      resume.parsingError = null;

      await resume.save();

      // Generate embedding and add to search index (non-blocking)
      try {
        const resumeText = resume.rawText || '';
        if (resumeText.trim()) {
          // Add to vector index for semantic search
          await aiServiceClient.addResumeToIndex(resume._id.toString(), resumeText);
          
          // If resume is linked to a job, trigger auto-matching
          if (resume.jobId) {
            // This will be handled by the automated screening pipeline
            setImmediate(async () => {
              try {
                const jobService = (await import('./jobService.js')).default;
                await jobService.autoMatchResume(resume.jobId, resume._id);
              } catch (err) {
                logger.error(`Auto-match failed for resume ${resume._id}:`, err);
              }
            });
          }
        }
      } catch (error) {
        // Don't fail the parsing if indexing fails
        logger.error(`Failed to add resume ${resume._id} to search index:`, error.message);
      }

      return resume;
    } catch (error) {
      // Update resume with error
      const resume = await Resume.findById(resumeId);
      if (resume) {
        resume.parsingStatus = 'failed';
        resume.parsingError = error.message;
        await resume.save();
      }
      throw error;
    }
  }

  /**
   * Retry parsing for a failed resume
   */
  async retryParsing(resumeId, tenantId) {
    try {
      const resume = await Resume.findOne({ _id: resumeId, tenantId });
      
      if (!resume) {
        throw new Error('Resume not found');
      }

      if (resume.parsingStatus === 'completed') {
        throw new Error('Resume is already parsed');
      }

      return await this.parseResumeAsync(resumeId);
    } catch (error) {
      throw new Error(`Failed to retry parsing: ${error.message}`);
    }
  }

  /**
   * Get all resumes for a tenant
   */
  /**
   * Calculate ATS Score - Enterprise ATS Platform Simulation
   * Mimics how Workday, Greenhouse, iCIMS, Taleo evaluate resumes
   * 
   * Scoring Breakdown:
   * - Keyword Matching (50%): JD keywords, hard skills, tools, certifications
   * - Resume Structure & Parsing (25%): Standard sections, formatting
   * - Skill Relevance & Density (15%): Skill frequency and placement
   * - Role & Title Alignment (10%): Job title matching
   * 
   * @param {Object} resume - Resume document with parsed data
   * @param {Object} parsedData - Raw parsed data from AI service
   * @param {Object} jobDescription - Optional JD for keyword matching (title, description, requirements, skills)
   * @returns {Object} { total: number, details: Object }
   */
  calculateATSScore(resume, parsedData, jobDescription = null) {
    // If Job Description provided, use JD-aware scoring
    if (jobDescription && jobDescription.description) {
      return this.calculateJDBasedATSScore(resume, parsedData, jobDescription);
    }
    
    // Otherwise, use resume quality scoring (backward compatible)
    return this.calculateQualityBasedATSScore(resume, parsedData);
  }

  /**
   * JD-Based ATS Scoring (Enterprise ATS Platform Logic)
   */
  calculateJDBasedATSScore(resume, parsedData, jobDescription) {
    let scores = {
      keywordMatching: 0,      // 50 points
      structureParsing: 0,     // 25 points
      skillRelevance: 0,       // 15 points
      titleAlignment: 0        // 10 points
    };

    // 1. KEYWORD MATCHING (50 points)
    const jdText = `${jobDescription.title} ${jobDescription.description} ${jobDescription.requirements || ''}`.toLowerCase();
    const resumeText = (resume.rawText || '').toLowerCase();
    
    // If no resume text, use fallback scoring
    if (!resumeText.trim()) {
      console.log('No resume text available, using quality-based scoring');
      return this.calculateQualityBasedATSScore(resume, parsedData);
    }
    
    // Extract keywords from JD
    const hardSkills = this.extractHardSkills(jdText);
    const tools = this.extractTools(jdText);
    const certifications = this.extractCertifications(jdText);
    
    // Match keywords
    let keywordMatches = 0;
    let totalKeywords = hardSkills.length + tools.length + certifications.length;
    
    // Hard Skills Matching (30 points)
    hardSkills.forEach(skill => {
      if (resumeText.includes(skill.toLowerCase())) {
        keywordMatches++;
      }
    });
    
    // Tools Matching (15 points)
    tools.forEach(tool => {
      if (resumeText.includes(tool.toLowerCase())) {
        keywordMatches++;
      }
    });
    
    // Certifications Matching (5 points)
    certifications.forEach(cert => {
      if (resumeText.includes(cert.toLowerCase())) {
        keywordMatches++;
      }
    });
    
    // Calculate keyword score
    const keywordMatchRate = totalKeywords > 0 ? (keywordMatches / totalKeywords) : 0;
    scores.keywordMatching = Math.round(keywordMatchRate * 50);

    // 2. RESUME STRUCTURE & PARSING (25 points)
    let structureScore = 0;
    const sectionsFound = parsedData.sections_found || 0;
    
    // Standard sections detected (15 points)
    if (sectionsFound >= 5) structureScore += 15;
    else if (sectionsFound >= 4) structureScore += 12;
    else if (sectionsFound >= 3) structureScore += 9;
    else if (sectionsFound >= 2) structureScore += 6;
    
    // Contact information completeness (10 points)
    if (resume.personalInfo?.email) structureScore += 3;
    if (resume.personalInfo?.phone) structureScore += 3;
    if (resume.personalInfo?.fullName && resume.personalInfo.fullName !== 'Not found') structureScore += 4;
    
    scores.structureParsing = Math.min(structureScore, 25);

    // 3. SKILL RELEVANCE & DENSITY (15 points)
    const resumeSkills = [
      ...(resume.skills?.technical || []),
      ...(resume.skills?.soft || []),
      ...(resume.skills?.tools || [])
    ];
    
    const jdSkills = Array.isArray(jobDescription.skills) ? jobDescription.skills : [];
    let relevanceScore = 0;
    
    if (jdSkills.length > 0) {
      // Check skill frequency in different sections
      const experienceText = (resume.experience || []).map(e => e.description || '').join(' ').toLowerCase();
      const skillsText = resumeSkills.join(' ').toLowerCase();
      
      jdSkills.forEach(jdSkill => {
        if (!jdSkill) return; // Skip null/undefined skills
        
        const skillLower = jdSkill.toLowerCase();
        let frequency = 0;
        
        // Skills section (weight: 3)
        if (skillsText.includes(skillLower)) frequency += 3;
        
        // Experience bullets (weight: 2)
        const expMatches = (experienceText.match(new RegExp(skillLower, 'g')) || []).length;
        frequency += Math.min(expMatches * 2, 6);
        
        if (frequency > 0) {
          relevanceScore += Math.min(frequency, 10);
        }
      });
    }
    
    scores.skillRelevance = Math.min(relevanceScore, 15);

    // 4. ROLE & TITLE ALIGNMENT (10 points)
    const jdTitle = (jobDescription.title || '').toLowerCase();
    const resumeTitles = (resume.experience || []).map(exp => (exp.title || '').toLowerCase()).filter(t => t);
    
    let titleScore = 0;
    if (jdTitle && resumeTitles.length > 0) {
      resumeTitles.forEach(resumeTitle => {
        // Exact match (10 points)
        if (resumeTitle === jdTitle) {
          titleScore = 10;
        }
        // Partial match (7 points)
        else if (resumeTitle.includes(jdTitle.split(' ')[0]) || jdTitle.includes(resumeTitle.split(' ')[0])) {
          titleScore = Math.max(titleScore, 7);
        }
        // Generic title penalty (3 points max)
        else if (resumeTitle.length > 5 && !['developer', 'engineer', 'manager', 'specialist'].includes(resumeTitle)) {
          titleScore = Math.max(titleScore, 3);
        }
      });
    }
    
    scores.titleAlignment = titleScore;

    const total = Math.min(
      scores.keywordMatching + 
      scores.structureParsing + 
      scores.skillRelevance + 
      scores.titleAlignment,
      100
    );

    return { 
      total, 
      details: {
        keywordMatching: scores.keywordMatching,
        structureParsing: scores.structureParsing,
        skillRelevance: scores.skillRelevance,
        titleAlignment: scores.titleAlignment,
        matchedKeywords: keywordMatches,
        totalKeywords: totalKeywords
      }
    };
  }

  /**
   * Extract hard skills from job description text
   */
  extractHardSkills(text) {
    const commonSkills = [
      'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust',
      'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel',
      'html', 'css', 'sass', 'typescript', 'sql', 'nosql', 'mongodb', 'postgresql', 'mysql',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'ci/cd', 'devops',
      'machine learning', 'data science', 'ai', 'deep learning', 'tensorflow', 'pytorch',
      'agile', 'scrum', 'jira', 'rest api', 'graphql', 'microservices', 'testing', 'junit'
    ];
    
    return commonSkills.filter(skill => text.includes(skill));
  }

  /**
   * Extract tools from job description text
   */
  extractTools(text) {
    const commonTools = [
      'vscode', 'intellij', 'eclipse', 'visual studio', 'pycharm', 'sublime',
      'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack', 'teams',
      'postman', 'swagger', 'figma', 'sketch', 'adobe', 'photoshop'
    ];
    
    return commonTools.filter(tool => text.includes(tool));
  }

  /**
   * Extract certifications from job description text
   */
  extractCertifications(text) {
    const commonCerts = [
      'aws certified', 'azure certified', 'gcp certified', 'pmp', 'scrum master', 'csm',
      'cissp', 'comptia', 'ccna', 'ccnp', 'ceh', 'itil', 'prince2', 'six sigma'
    ];
    
    return commonCerts.filter(cert => text.includes(cert));
  }

  /**
   * Quality-Based ATS Scoring (Original - Resume Quality without JD)
   * Used when no job description is available
   */
  calculateQualityBasedATSScore(resume, parsedData) {
    let scores = {
      formatScore: 0,
      keywordScore: 0,
      experienceScore: 0,
      educationScore: 0,
      skillsScore: 0
    };

    // Format Score (20 points)
    if (resume.personalInfo?.email) scores.formatScore += 5;
    if (resume.personalInfo?.phone) scores.formatScore += 5;
    if (resume.personalInfo?.fullName && resume.personalInfo.fullName !== 'Not found') scores.formatScore += 5;
    if (parsedData.sections_found >= 3) scores.formatScore += 5;

    // Keyword/Skills Score (30 points)
    const totalSkills = (resume.skills?.technical?.length || 0) + 
                        (resume.skills?.soft?.length || 0) + 
                        (resume.skills?.tools?.length || 0);
    if (totalSkills >= 10) scores.keywordScore = 30;
    else if (totalSkills >= 7) scores.keywordScore = 20;
    else if (totalSkills >= 5) scores.keywordScore = 15;
    else if (totalSkills >= 3) scores.keywordScore = 10;

    // Experience Score (25 points)
    const expCount = resume.experience?.length || 0;
    const totalExpYears = Math.floor((resume.totalExperience || 0) / 12);
    if (totalExpYears >= 5 && expCount >= 3) scores.experienceScore = 25;
    else if (totalExpYears >= 3 && expCount >= 2) scores.experienceScore = 20;
    else if (totalExpYears >= 2 && expCount >= 1) scores.experienceScore = 15;
    else if (expCount >= 1) scores.experienceScore = 10;

    // Education Score (15 points)
    const eduCount = resume.education?.length || 0;
    if (eduCount >= 2) scores.educationScore = 15;
    else if (eduCount >= 1) scores.educationScore = 10;
    else scores.educationScore = 5;

    // Skills Diversity Score (10 points)
    const hasTechnical = (resume.skills?.technical?.length || 0) > 0;
    const hasSoft = (resume.skills?.soft?.length || 0) > 0;
    const hasTools = (resume.skills?.tools?.length || 0) > 0;
    const hasCerts = (resume.certifications?.length || 0) > 0;
    let diversityPoints = 0;
    if (hasTechnical) diversityPoints += 3;
    if (hasSoft) diversityPoints += 2;
    if (hasTools) diversityPoints += 3;
    if (hasCerts) diversityPoints += 2;
    scores.skillsScore = Math.min(diversityPoints, 10);

    const total = Math.min(
      scores.formatScore + 
      scores.keywordScore + 
      scores.experienceScore + 
      scores.educationScore + 
      scores.skillsScore,
      100
    );

    return { total, details: scores };
  }

  async getResumes(tenantId, filters = {}) {
    try {
      const query = { tenantId };

      if (filters.jobId) {
        query.jobId = filters.jobId;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.parsingStatus) {
        query.parsingStatus = filters.parsingStatus;
      }

      if (filters.search) {
        query.$or = [
          { 'personalInfo.fullName': new RegExp(filters.search, 'i') },
          { 'personalInfo.email': new RegExp(filters.search, 'i') }
        ];
      }

      const resumes = await Resume.find(query)
        .select('-rawText -parsedText -textContent')
        .populate('jobId', 'title status')
        .populate('uploadedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(filters.limit || 100);

      return resumes;
    } catch (error) {
      throw new Error(`Failed to fetch resumes: ${error.message}`);
    }
  }

  /**
   * Get resume by ID
   */
  async getResumeById(resumeId, tenantId, userId = null) {
    try {
      const resume = await Resume.findOne({ _id: resumeId, tenantId })
        .populate('jobId', 'title description skills')
        .populate('uploadedBy', 'name email');

      if (!resume) {
        throw new Error('Resume not found');
      }

      // Increment view count
      if (userId) {
        await resume.incrementViews(userId);
      }

      return resume;
    } catch (error) {
      throw new Error(`Failed to fetch resume: ${error.message}`);
    }
  }

  /**
   * Update resume status
   */
  async updateResumeStatus(resumeId, status, tenantId) {
    try {
      const resume = await Resume.findOne({ _id: resumeId, tenantId });

      if (!resume) {
        throw new Error('Resume not found');
      }

      resume.status = status;
      await resume.save();

      return resume;
    } catch (error) {
      throw new Error(`Failed to update resume status: ${error.message}`);
    }
  }

  /**
   * Update resume notes and tags
   */
  async updateResumeMetadata(resumeId, tenantId, updates) {
    try {
      const resume = await Resume.findOne({ _id: resumeId, tenantId });

      if (!resume) {
        throw new Error('Resume not found');
      }

      if (updates.notes !== undefined) {
        resume.notes = updates.notes;
      }

      if (updates.tags !== undefined) {
        resume.tags = updates.tags;
      }

      await resume.save();

      return resume;
    } catch (error) {
      throw new Error(`Failed to update resume metadata: ${error.message}`);
    }
  }

  /**
   * Delete resume
   */
  async deleteResume(resumeId, tenantId) {
    try {
      const resume = await Resume.findOne({ _id: resumeId, tenantId });

      if (!resume) {
        throw new Error('Resume not found');
      }

      // Delete file from disk
      await deleteFile(resume.filePath).catch(err => {
        console.error('Error deleting file:', err);
      });

      // Delete from database
      await Resume.deleteOne({ _id: resumeId });

      return { message: 'Resume deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete resume: ${error.message}`);
    }
  }

  /**
   * Get resume statistics
   */
  async getResumeStats(tenantId, jobId = null) {
    try {
      return await Resume.getResumeStats(tenantId, jobId);
    } catch (error) {
      throw new Error(`Failed to fetch resume stats: ${error.message}`);
    }
  }

  /**
   * Search resumes
   */
  async searchResumes(tenantId, query) {
    try {
      return await Resume.searchResumes(tenantId, query);
    } catch (error) {
      throw new Error(`Failed to search resumes: ${error.message}`);
    }
  }

  /**
   * Get resumes by job with match data
   */
  async getResumesByJob(jobId, tenantId) {
    try {
      const resumes = await Resume.find({ jobId, tenantId })
        .populate('uploadedBy', 'name email')
        .sort({ matchScore: -1, createdAt: -1 })
        .lean();

      console.log(`📋 Found ${resumes.length} resumes for job ${jobId}`);
      
      // Get match data for all resumes
      const Match = (await import('../models/Match.js')).default;
      const resumeIds = resumes.map(r => r._id);
      const matches = await Match.find({ 
        jobId, 
        resumeId: { $in: resumeIds } 
      }).lean();
      
      // Create a map of resumeId -> match for quick lookup
      const matchMap = {};
      matches.forEach(match => {
        matchMap[match.resumeId.toString()] = match;
      });
      
      // Enrich resumes with match data
      const enrichedResumes = resumes.map(resume => {
        const match = matchMap[resume._id.toString()];
        
        return {
          ...resume,
          matchScore: match?.overallScore || resume.matchScore || 0,
          overallScore: match?.overallScore || resume.matchScore || 0,
          matchDetails: match ? {
            skillMatch: match.skillMatch?.score || 0,
            experienceMatch: match.experienceMatch?.score || 0,
            educationMatch: match.educationMatch?.score || 0,
            semanticSimilarity: match.semanticSimilarity || 0,
            strengths: match.strengths || [],
            concerns: match.concerns || [],
            recommendation: match.recommendation || 'pending'
          } : null,
          reviewStatus: match?.reviewStatus || 'pending',
          isShortlisted: match?.isShortlisted || false
        };
      });
      
      // Log first enriched resume for debugging
      if (enrichedResumes.length > 0) {
        console.log('📄 Sample enriched resume:', {
          _id: enrichedResumes[0]._id,
          fileName: enrichedResumes[0].fileName,
          parsingStatus: enrichedResumes[0].parsingStatus,
          hasPersonalInfo: !!enrichedResumes[0].personalInfo,
          matchScore: enrichedResumes[0].matchScore,
          atsScore: enrichedResumes[0].atsScore,
          hasMatchDetails: !!enrichedResumes[0].matchDetails,
          matchDetails: enrichedResumes[0].matchDetails,
          reviewStatus: enrichedResumes[0].reviewStatus
        });
      }

      return enrichedResumes;
    } catch (error) {
      console.error('Error in getResumesByJob:', error);
      throw new Error(`Failed to fetch resumes for job: ${error.message}`);
    }
  }

  /**
   * Bulk update resume status
   */
  async bulkUpdateStatus(resumeIds, status, tenantId) {
    try {
      const result = await Resume.updateMany(
        { _id: { $in: resumeIds }, tenantId },
        { $set: { status } }
      );

      return {
        message: `${result.modifiedCount} resumes updated successfully`,
        modifiedCount: result.modifiedCount
      };
    } catch (error) {
      throw new Error(`Failed to bulk update resumes: ${error.message}`);
    }
  }

  /**
   * Add note to resume
   */
  async addNote(resumeId, noteText, userId, tenantId) {
    try {
      const resume = await Resume.findOne({ _id: resumeId, tenantId });
      
      if (!resume) {
        throw new Error('Resume not found');
      }

      resume.notes.push({
        text: noteText,
        addedBy: userId,
        addedAt: new Date()
      });

      await resume.save();
      return await resume.populate('notes.addedBy', 'name email');
    } catch (error) {
      throw new Error(`Failed to add note: ${error.message}`);
    }
  }

  /**
   * Get notes for resume
   */
  async getNotes(resumeId, tenantId) {
    try {
      const resume = await Resume.findOne({ _id: resumeId, tenantId })
        .populate('notes.addedBy', 'name email');
      
      if (!resume) {
        throw new Error('Resume not found');
      }

      return resume.notes || [];
    } catch (error) {
      throw new Error(`Failed to get notes: ${error.message}`);
    }
  }
}

export default new ResumeService();
