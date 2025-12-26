import Job from '../models/Job.js';
import Resume from '../models/Resume.js';
import Match from '../models/Match.js';
import { incrementUsage } from './usageService.js';
import aiServiceClient from './aiServiceClient.js';
import cacheService from '../utils/cache.js';
import logger from '../utils/logger.js';

class JobService {
  /**
   * Create a new job posting
   */
  async createJob(jobData, userId, tenantId) {
    try {
      const job = new Job({
        ...jobData,
        tenantId,
        createdBy: userId
      });

      await job.save();

      // Record usage
      await incrementUsage(tenantId, 'jobsCreated');

      return job;
    } catch (error) {
      throw new Error(`Failed to create job: ${error.message}`);
    }
  }

  /**
   * Get all jobs for a tenant with optional filters
   */
  async getJobs(tenantId, filters = {}) {
    try {
      const query = { tenantId };

      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.employmentType) {
        query.employmentType = filters.employmentType;
      }

      if (filters.experienceLevel) {
        query.experienceLevel = filters.experienceLevel;
      }

      if (filters.location) {
        query['location.type'] = filters.location;
      }

      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      const jobs = await Job.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(filters.limit || 50);

      return jobs;
    } catch (error) {
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }
  }

  /**
   * Get a single job by ID (with caching)
   */
  async getJobById(jobId, tenantId) {
    try {
      // Try cache first
      const cacheKey = cacheService.generateKey(tenantId, 'job', jobId);
      const cached = await cacheService.get(cacheKey);
      
      if (cached) {
        logger.debug(`Cache hit for job ${jobId}`);
        return cached;
      }

      const job = await Job.findOne({ _id: jobId, tenantId })
        .populate('createdBy', 'name email')
        .lean(); // Use lean for better performance

      if (!job) {
        throw new Error('Job not found');
      }

      // Cache the result (5 minutes)
      await cacheService.set(cacheKey, job, 300);

      // Increment view count (non-blocking)
      Job.findByIdAndUpdate(jobId, { $inc: { viewCount: 1 } }).exec().catch(err => {
        logger.error(`Failed to increment view count for job ${jobId}:`, err);
      });

      return job;
    } catch (error) {
      throw new Error(`Failed to fetch job: ${error.message}`);
    }
  }

  /**
   * Update a job (invalidates cache)
   */
  async updateJob(jobId, updateData, tenantId) {
    try {
      const job = await Job.findOne({ _id: jobId, tenantId });

      if (!job) {
        throw new Error('Job not found');
      }

      // Update fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          job[key] = updateData[key];
        }
      });

      await job.save();

      // Invalidate cache
      const cacheKey = cacheService.generateKey(tenantId, 'job', jobId);
      await cacheService.del(cacheKey);
      logger.debug(`Cache invalidated for job ${jobId}`);

      return job;
    } catch (error) {
      throw new Error(`Failed to update job: ${error.message}`);
    }
  }

  /**
   * Delete a job (invalidates cache)
   */
  async deleteJob(jobId, tenantId) {
    try {
      const job = await Job.findOneAndDelete({ _id: jobId, tenantId });
      
      // Invalidate cache
      const cacheKey = cacheService.generateKey(tenantId, 'job', jobId);
      await cacheService.del(cacheKey);
      logger.debug(`Cache invalidated for deleted job ${jobId}`);

      if (!job) {
        throw new Error('Job not found');
      }

      return { message: 'Job deleted successfully', job };
    } catch (error) {
      throw new Error(`Failed to delete job: ${error.message}`);
    }
  }

  /**
   * Change job status
   */
  async changeJobStatus(jobId, status, tenantId) {
    try {
      const validStatuses = ['draft', 'active', 'paused', 'closed', 'archived'];
      
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const job = await Job.findOne({ _id: jobId, tenantId });

      if (!job) {
        throw new Error('Job not found');
      }

      job.status = status;
      await job.save();

      return job;
    } catch (error) {
      throw new Error(`Failed to change job status: ${error.message}`);
    }
  }

  /**
   * Get job statistics for a tenant
   */
  async getJobStats(tenantId) {
    try {
      const stats = await Job.getJobStats(tenantId);
      
      const totalJobs = await Job.countDocuments({ tenantId });
      const activeJobs = await Job.countDocuments({ tenantId, status: 'active' });
      
      const totalApplicants = await Job.aggregate([
        { $match: { tenantId } },
        { $group: { _id: null, total: { $sum: '$applicantsCount' } } }
      ]);

      const totalViews = await Job.aggregate([
        { $match: { tenantId } },
        { $group: { _id: null, total: { $sum: '$viewsCount' } } }
      ]);

      return {
        totalJobs,
        activeJobs,
        statusBreakdown: stats,
        totalApplicants: totalApplicants[0]?.total || 0,
        totalViews: totalViews[0]?.total || 0
      };
    } catch (error) {
      throw new Error(`Failed to fetch job stats: ${error.message}`);
    }
  }

  /**
   * Get active jobs only
   */
  async getActiveJobs(tenantId) {
    try {
      const jobs = await Job.getActiveJobs(tenantId)
        .populate('createdBy', 'name email');

      return jobs;
    } catch (error) {
      throw new Error(`Failed to fetch active jobs: ${error.message}`);
    }
  }

  /**
   * Duplicate a job
   */
  async duplicateJob(jobId, tenantId, userId) {
    try {
      const originalJob = await Job.findOne({ _id: jobId, tenantId });

      if (!originalJob) {
        throw new Error('Job not found');
      }

      const jobData = originalJob.toObject();
      delete jobData._id;
      delete jobData.createdAt;
      delete jobData.updatedAt;
      delete jobData.__v;
      
      jobData.title = `${jobData.title} (Copy)`;
      jobData.status = 'draft';
      jobData.applicantsCount = 0;
      jobData.viewsCount = 0;
      jobData.createdBy = userId;

      const newJob = await this.createJob(jobData, userId, tenantId);

      return newJob;
    } catch (error) {
      throw new Error(`Failed to duplicate job: ${error.message}`);
    }
  }

  /**
   * Bulk update job status
   */
  async bulkUpdateStatus(jobIds, status, tenantId) {
    try {
      const validStatuses = ['draft', 'active', 'paused', 'closed', 'archived'];
      
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const result = await Job.updateMany(
        { _id: { $in: jobIds }, tenantId },
        { $set: { status } }
      );

      return {
        message: `${result.modifiedCount} jobs updated successfully`,
        modifiedCount: result.modifiedCount
      };
    } catch (error) {
      throw new Error(`Failed to bulk update jobs: ${error.message}`);
    }
  }

  /**
   * Rank candidates for a job using AI
   */
  async rankCandidatesForJob(jobId, tenantId, topN = 10) {
    try {
      const job = await Job.findOne({ _id: jobId, tenantId }).select('title description requirements responsibilities qualifications');
      if (!job) {
        throw new Error('Job not found');
      }

      // Get all resumes for this job
      const resumes = await Resume.find({ 
        jobId,
        tenantId,
        parsingStatus: 'completed'
      }).select('_id rawText personalInfo');

      if (resumes.length === 0) {
        return {
          ranked_candidates: [],
          total_candidates: 0
        };
      }

      // Build job description text with safety checks for undefined arrays
      const jobDescription = `${job.title}\n\n${job.description}\n\nRequirements:\n${(job.requirements || []).join('\n')}\n\nResponsibilities:\n${(job.responsibilities || []).join('\n')}\n\nQualifications:\n${(job.qualifications || []).join('\n')}`;

      // Call AI service to rank candidates
      const rankingResult = await aiServiceClient.rankCandidates(
        jobDescription,
        resumes.map(r => ({
          id: r._id.toString(),
          text: r.rawText || ''
        })),
        topN
      );

      // Record usage
      await incrementUsage(tenantId, 'embeddingCalls', resumes.length);
      await incrementUsage(tenantId, 'llmCalls', 1);

      return rankingResult;
    } catch (error) {
      logger.error(`Failed to rank candidates for job ${jobId}:`, error);
      throw new Error(`Failed to rank candidates: ${error.message}`);
    }
  }

  /**
   * Auto-match a single resume against a job
   */
  async autoMatchResume(jobId, resumeId) {
    try {
      const job = await Job.findById(jobId).select('title description requirements responsibilities qualifications tenantId');
      const resume = await Resume.findById(resumeId).select('rawText personalInfo tenantId atsScore');

      if (!job || !resume) {
        throw new Error('Job or resume not found');
      }

      if (job.tenantId.toString() !== resume.tenantId.toString()) {
        throw new Error('Tenant mismatch');
      }

      // Check if match already exists
      const existingMatch = await Match.findOne({ jobId, resumeId });
      if (existingMatch) {
        logger.info(`Match already exists for job ${jobId} and resume ${resumeId}`);
        return existingMatch;
      }

      // Build job description with safety checks for undefined arrays
      const jobDescription = `${job.title}\n\n${job.description}\n\nRequirements:\n${(job.requirements || []).join('\n')}`;

      // Validate resume has raw text
      if (!resume.rawText || resume.rawText.trim().length === 0) {
        console.error('❌ Cannot match - resume has no text:', {
          resumeId,
          fileName: resume.fileName,
          parsingStatus: resume.parsingStatus
        });
        throw new Error('Resume has no parsed text. Parsing may have failed.');
      }

      console.log('🔄 Calculating match score:', {
        resumeId,
        jobId,
        resumeTextLength: resume.rawText.length,
        jobDescriptionLength: jobDescription.length
      });

      // Calculate match score using AI
      const matchResult = await aiServiceClient.calculateMatchScore(
        resume.rawText || '',
        jobDescription,
        resumeId.toString(),
        jobId.toString()
      );

      if (!matchResult.success || !matchResult.match) {
        console.error('❌ Match calculation failed:', {
          success: matchResult.success,
          error: matchResult.error,
          hasMatch: !!matchResult.match
        });
        throw new Error(`Failed to calculate match score: ${matchResult.error || 'Unknown error'}`);
      }

      const aiMatch = matchResult.match;

      // Log match results for debugging
      console.log('🎯 Match Score Calculated:', {
        jobId,
        resumeId,
        overallScore: aiMatch.score.overall_score,
        skillsScore: aiMatch.score.skills_score,
        experienceScore: aiMatch.score.experience_score,
        educationScore: aiMatch.score.education_score,
        similarityScore: aiMatch.similarity_score,
        atsScore: resume.atsScore
      });

      // Determine initial review status based on ATS and match scores
      let reviewStatus = 'pending';
      let isShortlisted = false;
      const atsScore = resume.atsScore || 0;
      const matchScore = aiMatch.score.overall_score;
      
      // Auto-shortlist high-scoring candidates
      if (atsScore >= 70 && matchScore >= 70) {
        reviewStatus = 'reviewed';
        isShortlisted = true;
      } else if (atsScore >= 60 && matchScore >= 60) {
        reviewStatus = 'in_review';
      } else if (atsScore < 40 || matchScore < 40) {
        reviewStatus = 'rejected';
      }

      // Create match record
      const match = new Match({
        jobId,
        resumeId,
        tenantId: job.tenantId,
        status: 'completed', // Calculation status
        reviewStatus: reviewStatus, // Review workflow status
        isShortlisted: isShortlisted,
        overallScore: matchScore,
        skillMatch: {
          score: aiMatch.score.skills_score || 0,
          matchedSkills: (aiMatch.matched_skills || []).map(skill => ({
            skill: typeof skill === 'string' ? skill : skill.name,
            confidence: 1.0,
            source: 'exact'
          })),
          missingSkills: aiMatch.missing_skills || [],
          additionalSkills: []
        },
        experienceMatch: {
          score: aiMatch.score.experience_score || 0,
          relevant: (aiMatch.score.experience_score || 0) >= 60
        },
        educationMatch: {
          score: aiMatch.score.education_score || 0,
          meets: (aiMatch.score.education_score || 0) >= 60
        },
        semanticSimilarity: aiMatch.similarity_score || 0,
        strengths: aiMatch.explanation?.strengths || [],
        concerns: aiMatch.explanation?.weaknesses || [],
        aiReasoning: aiMatch.explanation?.summary || '',
        recommendation: matchScore >= 80 ? 'strong_match' : 
                       matchScore >= 70 ? 'good_match' :
                       matchScore >= 60 ? 'potential_match' :
                       matchScore >= 50 ? 'weak_match' : 'not_recommended'
      });

      await match.save();

      // Increment job applicants count
      await job.incrementApplicants();

      // Record usage
      await incrementUsage(job.tenantId, 'llmCalls', 1);
      await incrementUsage(job.tenantId, 'embeddingCalls', 2);

      logger.info(`Created match for job ${jobId} and resume ${resumeId} with score ${match.overallScore}, reviewStatus: ${reviewStatus}, shortlisted: ${isShortlisted}`);

      return match;
    } catch (error) {
      logger.error(`Failed to auto-match resume ${resumeId} to job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Get top candidates for a job
   */
  async getTopCandidates(jobId, tenantId, limit = 10) {
    try {
      const matches = await Match.find({ jobId, tenantId })
        .sort({ overallScore: -1 })
        .limit(limit)
        .populate('resumeId', 'personalInfo fileName uploadedAt')
        .select('overallScore skillsScore experienceScore educationScore explanation');

      return matches;
    } catch (error) {
      throw new Error(`Failed to get top candidates: ${error.message}`);
    }
  }

  /**
   * Re-screen all candidates for a job (useful after job description update)
   */
  async rescreenCandidates(jobId, tenantId) {
    try {
      const job = await Job.findOne({ _id: jobId, tenantId });
      if (!job) {
        throw new Error('Job not found');
      }

      // Get all resumes for this job
      const resumes = await Resume.find({ 
        jobId,
        tenantId,
        parsingStatus: 'completed'
      });

      // Delete existing matches
      await Match.deleteMany({ jobId, tenantId });

      // Re-match all resumes
      const matchPromises = resumes.map(resume => 
        this.autoMatchResume(jobId, resume._id).catch(err => {
          logger.error(`Failed to re-match resume ${resume._id}:`, err);
          return null;
        })
      );

      const results = await Promise.all(matchPromises);
      const successCount = results.filter(r => r !== null).length;

      return {
        total: resumes.length,
        success: successCount,
        failed: resumes.length - successCount
      };
    } catch (error) {
      throw new Error(`Failed to rescreen candidates: ${error.message}`);
    }
  }

  /**
   * Get AI-powered insights for a job
   */
  async getJobInsights(jobId, tenantId) {
    try {
      const job = await Job.findOne({ _id: jobId, tenantId });
      if (!job) {
        throw new Error('Job not found');
      }

      // Get match statistics
      const matches = await Match.find({ jobId, tenantId });
      const totalCandidates = matches.length;

      if (totalCandidates === 0) {
        return {
          totalCandidates: 0,
          averageScore: 0,
          topCandidateScore: 0,
          qualifiedCandidates: 0,
          skillGaps: []
        };
      }

      // Calculate statistics
      const scores = matches.map(m => m.overallScore);
      const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const topCandidateScore = Math.max(...scores);
      const qualifiedCandidates = matches.filter(m => m.overallScore >= 70).length;

      // Analyze skill gaps
      const allMissingSkills = matches.flatMap(m => m.missingSkills);
      const skillGapCounts = {};
      allMissingSkills.forEach(skill => {
        skillGapCounts[skill] = (skillGapCounts[skill] || 0) + 1;
      });

      const skillGaps = Object.entries(skillGapCounts)
        .map(([skill, count]) => ({
          skill,
          count,
          percentage: (count / totalCandidates * 100).toFixed(1)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalCandidates,
        averageScore: averageScore.toFixed(1),
        topCandidateScore: topCandidateScore.toFixed(1),
        qualifiedCandidates,
        qualifiedPercentage: (qualifiedCandidates / totalCandidates * 100).toFixed(1),
        skillGaps
      };
    } catch (error) {
      throw new Error(`Failed to get job insights: ${error.message}`);
    }
  }
}

export default new JobService();
