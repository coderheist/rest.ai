import Match from '../models/Match.js';
import Job from '../models/Job.js';
import Resume from '../models/Resume.js';
import { incrementUsage } from './usageService.js';
import aiMatchingService from './aiMatchingService.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

class MatchService {
  /**
   * Calculate match score between a job and resume
   */
  async calculateMatch(jobId, resumeId, tenantId) {
    try {
      // Check if match already exists
      const existingMatch = await Match.findOne({ jobId, resumeId, tenantId });
      if (existingMatch) {
        return existingMatch;
      }

      // Fetch job and resume
      const job = await Job.findById(jobId);
      const resume = await Resume.findById(resumeId);

      if (!job || !resume) {
        throw new Error('Job or Resume not found');
      }

      // Prepare data for AI service
      const matchData = {
        job: {
          title: job.title,
          description: job.description,
          requiredSkills: job.requiredSkills,
          experienceYears: job.experienceYears,
          educationLevel: job.educationLevel,
          qualifications: job.qualifications,
          responsibilities: job.responsibilities
        },
        resume: {
          personalInfo: resume.personalInfo,
          skills: resume.skills,
          experience: resume.experience,
          education: resume.education,
          rawText: resume.rawText
        }
      };

      // Try AI-based matching first (Gemini/OpenAI)
      let matchResult = await aiMatchingService.calculateAIMatch(matchData.job, matchData.resume);
      let usedAI = false;

      // If AI matching failed or not configured, fall back to rule-based
      if (!matchResult) {
        console.log('Using rule-based matching as fallback');
        matchResult = await this.calculateRuleBasedMatch(matchData);
      } else {
        console.log('Using AI-based matching');
        usedAI = true;
      }

      // Create match record
      const match = new Match({
        tenantId,
        jobId,
        resumeId,
        overallScore: matchResult.overallScore,
        skillMatch: matchResult.skillMatch,
        experienceMatch: matchResult.experienceMatch,
        educationMatch: matchResult.educationMatch,
        semanticSimilarity: matchResult.semanticSimilarity || 0,
        strengths: matchResult.strengths,
        concerns: matchResult.concerns,
        recommendation: matchResult.recommendation,
        aiReasoning: matchResult.reasoning,
        status: 'completed'
      });

      await match.save();

      // Track usage (count LLM calls only if AI was used)
      if (usedAI) {
        await incrementUsage(tenantId, 'llmCalls', 1);
      }

      return match;
    } catch (error) {
      throw new Error(`Failed to calculate match: ${error.message}`);
    }
  }

  /**
   * Rule-based matching (placeholder for AI service)
   */
  async calculateRuleBasedMatch(data) {
    const { job, resume } = data;

    // Skill matching
    const skillMatch = this.calculateSkillMatch(
      job.requiredSkills || [],
      resume.skills || {}
    );

    // Experience matching
    const experienceMatch = this.calculateExperienceMatch(
      job.experienceYears || {},
      resume.experience || []
    );

    // Education matching
    const educationMatch = this.calculateEducationMatch(
      job.educationLevel,
      resume.education || []
    );

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      skillMatch.score * 0.5 +
      experienceMatch.score * 0.3 +
      educationMatch.score * 0.2
    );

    // Generate recommendation
    const recommendation = this.determineRecommendation(overallScore);

    // Generate strengths and concerns
    const { strengths, concerns } = this.generateInsights(
      skillMatch,
      experienceMatch,
      educationMatch,
      overallScore
    );

    return {
      overallScore,
      skillMatch,
      experienceMatch,
      educationMatch,
      semanticSimilarity: 0.75, // Placeholder
      strengths,
      concerns,
      recommendation,
      reasoning: `Match calculated based on skills (${skillMatch.score}%), experience (${experienceMatch.score}%), and education (${educationMatch.score}%).`
    };
  }

  /**
   * Calculate skill match score
   */
  calculateSkillMatch(requiredSkills, candidateSkills) {
    const required = requiredSkills.map(s => s.toLowerCase());
    
    // Flatten all candidate skills
    const candidate = [
      ...(candidateSkills.technical || []),
      ...(candidateSkills.soft || []),
      ...(candidateSkills.tools || []),
      ...(candidateSkills.languages || [])
    ].map(s => s.toLowerCase());

    if (required.length === 0) {
      return {
        score: 100,
        matchedSkills: [],
        missingSkills: [],
        additionalSkills: candidate
      };
    }

    // Find matched skills
    const matched = required.filter(r => 
      candidate.some(c => c.includes(r) || r.includes(c))
    );

    const matchedSkills = matched.map(skill => ({
      skill,
      confidence: 1.0,
      source: 'exact'
    }));

    const missingSkills = required.filter(r => !matched.includes(r));
    const additionalSkills = candidate.filter(c => 
      !required.some(r => c.includes(r) || r.includes(c))
    );

    const score = Math.round((matched.length / required.length) * 100);

    return {
      score,
      matchedSkills,
      missingSkills,
      additionalSkills
    };
  }

  /**
   * Calculate experience match score
   */
  calculateExperienceMatch(requiredYears, candidateExperience) {
    const minYears = requiredYears.min || 0;
    const maxYears = requiredYears.max || 999;

    // Calculate total years from experience array
    const totalYears = candidateExperience.reduce((sum, exp) => {
      if (exp.startDate && exp.endDate) {
        const start = new Date(exp.startDate);
        const end = exp.current ? new Date() : new Date(exp.endDate);
        const years = (end - start) / (1000 * 60 * 60 * 24 * 365);
        return sum + years;
      }
      return sum;
    }, 0);

    const candidateYears = Math.round(totalYears * 10) / 10;

    let score;
    let relevant = true;
    let details = '';

    if (candidateYears < minYears) {
      score = Math.max(0, Math.round((candidateYears / minYears) * 80));
      details = `Candidate has ${candidateYears} years, below minimum ${minYears} years`;
      relevant = false;
    } else if (candidateYears > maxYears) {
      score = 90;
      details = `Candidate has ${candidateYears} years, above maximum ${maxYears} years (overqualified)`;
    } else {
      score = 100;
      details = `Candidate has ${candidateYears} years, within required range ${minYears}-${maxYears} years`;
    }

    return {
      score,
      requiredYears: `${minYears}-${maxYears}`,
      candidateYears,
      relevant,
      details
    };
  }

  /**
   * Calculate education match score
   */
  calculateEducationMatch(requiredLevel, candidateEducation) {
    const educationLevels = {
      'high_school': 1,
      'associate': 2,
      'bachelor': 3,
      'master': 4,
      'doctorate': 5
    };

    if (!requiredLevel || requiredLevel === 'none') {
      return {
        score: 100,
        meets: true,
        details: 'No specific education requirement'
      };
    }

    if (candidateEducation.length === 0) {
      return {
        score: 0,
        meets: false,
        details: 'No education information provided'
      };
    }

    // Get highest education level
    const highestLevel = candidateEducation.reduce((max, edu) => {
      const level = educationLevels[edu.degree?.toLowerCase()] || 0;
      return level > max ? level : max;
    }, 0);

    const requiredLevelValue = educationLevels[requiredLevel.toLowerCase()] || 0;

    if (highestLevel >= requiredLevelValue) {
      return {
        score: 100,
        meets: true,
        details: `Candidate meets or exceeds required education level`
      };
    } else {
      const score = Math.round((highestLevel / requiredLevelValue) * 80);
      return {
        score,
        meets: false,
        details: `Candidate's education level is below requirement`
      };
    }
  }

  /**
   * Determine recommendation based on overall score
   */
  determineRecommendation(score) {
    if (score >= 85) return 'strong_match';
    if (score >= 70) return 'good_match';
    if (score >= 55) return 'potential_match';
    if (score >= 40) return 'weak_match';
    return 'not_recommended';
  }

  /**
   * Generate insights (strengths and concerns)
   */
  generateInsights(skillMatch, experienceMatch, educationMatch, overallScore) {
    const strengths = [];
    const concerns = [];

    // Skills
    if (skillMatch.score >= 80) {
      strengths.push(`Strong skill match with ${skillMatch.matchedSkills.length} key skills`);
    } else if (skillMatch.score >= 60) {
      strengths.push(`Good skill alignment with room for development`);
    } else {
      concerns.push(`Missing ${skillMatch.missingSkills.length} required skills`);
    }

    if (skillMatch.additionalSkills.length > 5) {
      strengths.push(`Brings additional skills beyond requirements`);
    }

    // Experience
    if (experienceMatch.score >= 90) {
      strengths.push(experienceMatch.details);
    } else if (experienceMatch.score < 70) {
      concerns.push(experienceMatch.details);
    }

    // Education
    if (educationMatch.meets) {
      strengths.push(educationMatch.details);
    } else {
      concerns.push(educationMatch.details);
    }

    // Overall
    if (overallScore >= 80) {
      strengths.push('Excellent overall candidate profile');
    }

    return { strengths, concerns };
  }

  /**
   * Calculate matches for all resumes in a job
   */
  async calculateJobMatches(jobId, tenantId) {
    try {
      const resumes = await Resume.find({ jobId, tenantId, parsingStatus: 'completed' });
      const matches = [];

      for (const resume of resumes) {
        const match = await this.calculateMatch(jobId, resume._id, tenantId);
        matches.push(match);
      }

      // Update rankings
      await Match.updateRankings(jobId, tenantId);

      return matches;
    } catch (error) {
      throw new Error(`Failed to calculate job matches: ${error.message}`);
    }
  }

  /**
   * Get ranked candidates for a job
   */
  async getRankedCandidates(jobId, tenantId, options = {}) {
    try {
      return await Match.findByJob(jobId, tenantId, options);
    } catch (error) {
      throw new Error(`Failed to get ranked candidates: ${error.message}`);
    }
  }

  /**
   * Get matches for a resume
   */
  async getResumeMatches(resumeId, tenantId, options = {}) {
    try {
      return await Match.findByResume(resumeId, tenantId, options);
    } catch (error) {
      throw new Error(`Failed to get resume matches: ${error.message}`);
    }
  }

  /**
   * Get single match
   */
  async getMatch(matchId, tenantId) {
    try {
      return await Match.findOne({ _id: matchId, tenantId })
        .populate('jobId', 'title company department')
        .populate('resumeId', 'fileName personalInfo skills');
    } catch (error) {
      throw new Error(`Failed to get match: ${error.message}`);
    }
  }

  /**
   * Get match statistics
   */
  async getMatchStats(jobId, tenantId) {
    try {
      return await Match.getJobStats(jobId, tenantId);
    } catch (error) {
      throw new Error(`Failed to get match stats: ${error.message}`);
    }
  }

  /**
   * Update match status
   */
  async updateMatchStatus(matchId, status, userId, notes, tenantId) {
    try {
      const match = await Match.findOne({ _id: matchId, tenantId });
      if (!match) {
        throw new Error('Match not found');
      }

      return await match.updateStatus(status, userId, notes);
    } catch (error) {
      throw new Error(`Failed to update match status: ${error.message}`);
    }
  }

  /**
   * Update rankings
   */
  async updateRankings(jobId, tenantId) {
    try {
      return await Match.updateRankings(jobId, tenantId);
    } catch (error) {
      throw new Error(`Failed to update rankings: ${error.message}`);
    }
  }

  /**
   * Get top matches across all jobs
   */
  async getTopMatches(tenantId, limit = 20) {
    try {
      return await Match.getTopMatches(tenantId, limit);
    } catch (error) {
      throw new Error(`Failed to get top matches: ${error.message}`);
    }
  }

  /**
   * Search matches with filters
   */
  async searchMatches(tenantId, filters) {
    try {
      return await Match.searchMatches(tenantId, filters);
    } catch (error) {
      throw new Error(`Failed to search matches: ${error.message}`);
    }
  }

  /**
   * Toggle shortlist status for a match
   */
  async toggleShortlist(matchId, userId, tenantId) {
    try {
      const match = await Match.findOne({ _id: matchId, tenantId });
      if (!match) {
        throw new Error('Match not found');
      }

      await match.toggleShortlist(userId);
      
      // Populate references for return
      await match.populate([
        { path: 'jobId', select: 'title department status' },
        { path: 'resumeId', select: 'fileName candidateInfo' }
      ]);

      return match;
    } catch (error) {
      throw new Error(`Failed to toggle shortlist: ${error.message}`);
    }
  }

  /**
   * Get shortlisted candidates
   */
  async getShortlistedCandidates(tenantId, filters = {}) {
    try {
      const query = { 
        tenantId, 
        isShortlisted: true 
      };

      if (filters.jobId) {
        query.jobId = filters.jobId;
      }

      if (filters.minScore) {
        query.overallScore = { $gte: filters.minScore };
      }

      const matches = await Match.find(query)
        .populate('jobId', 'title department status')
        .populate('resumeId', 'fileName candidateInfo skills experience')
        .populate('shortlistedBy', 'name email')
        .sort({ shortlistedAt: -1 })
        .limit(filters.limit || 100);

      return matches;
    } catch (error) {
      throw new Error(`Failed to get shortlisted candidates: ${error.message}`);
    }
  }

  /**
   * Assign interviewer to a match
   */
  async assignInterviewer(matchId, userId, assignedBy, tenantId) {
    try {
      const match = await Match.findOne({ _id: matchId, tenantId });
      if (!match) {
        throw new Error('Match not found');
      }

      await match.assignInterviewer(userId, assignedBy);
      
      await match.populate([
        { path: 'jobId', select: 'title department' },
        { path: 'resumeId', select: 'candidateInfo fileName' },
        { path: 'assignedInterviewers.userId', select: 'name email' },
        { path: 'assignedInterviewers.assignedBy', select: 'name email' }
      ]);

      return match;
    } catch (error) {
      throw new Error(`Failed to assign interviewer: ${error.message}`);
    }
  }

  /**
   * Unassign interviewer from a match
   */
  async unassignInterviewer(matchId, userId, tenantId) {
    try {
      const match = await Match.findOne({ _id: matchId, tenantId });
      if (!match) {
        throw new Error('Match not found');
      }

      await match.unassignInterviewer(userId);
      
      await match.populate([
        { path: 'jobId', select: 'title department' },
        { path: 'resumeId', select: 'candidateInfo fileName' }
      ]);

      return match;
    } catch (error) {
      throw new Error(`Failed to unassign interviewer: ${error.message}`);
    }
  }
}

export default new MatchService();
