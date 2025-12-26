/**
 * AI Service Client
 * Handles communication with Python AI service for ML operations
 */
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import logger from '../utils/logger.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_SERVICE_TIMEOUT = parseInt(process.env.AI_SERVICE_TIMEOUT) || 120000; // Increased to 120 seconds

// Create axios instance with default config
const aiServiceClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: AI_SERVICE_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for logging
aiServiceClient.interceptors.request.use(
  (config) => {
    logger.info(`AI Service Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    logger.error('AI Service Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
aiServiceClient.interceptors.response.use(
  (response) => {
    logger.info(`AI Service Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      logger.error(`AI Service Error: ${error.response.status} - ${JSON.stringify(error.response.data?.error || error.message)}`);
    } else if (error.request) {
      logger.error('AI Service No Response:', {
        message: error.message || 'No response from AI service',
        url: AI_SERVICE_URL,
        code: error.code
      });
    } else {
      logger.error('AI Service Error:', error.message || 'Unknown error');
    }
    return Promise.reject(error);
  }
);

/**
 * Health check for AI service
 */
export const checkAIServiceHealth = async () => {
  try {
    const response = await aiServiceClient.get('/health');
    return {
      available: true,
      status: response.data
    };
  } catch (error) {
    logger.error('AI Service health check failed:', error.message);
    return {
      available: false,
      error: error.message
    };
  }
};

/**
 * Parse resume file (PDF or DOCX)
 */
export const parseResume = async (filePath, fileType = 'pdf') => {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const endpoint = fileType === 'pdf' ? '/api/parse/pdf' : '/api/parse/docx';
    
    logger.info(`Parsing ${fileType.toUpperCase()} resume: ${filePath}`);
    
    const response = await aiServiceClient.post(endpoint, formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 120000 // Increased to 120 seconds for AI processing
    });

    return response.data;
  } catch (error) {
    // Check if AI service is available
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      logger.error(`AI Service not available at ${AI_SERVICE_URL}`);
      throw new Error(`AI Service is not running. Please start the AI service at ${AI_SERVICE_URL}`);
    }
    
    const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
    logger.error('Resume parsing error:', errorMessage);
    throw new Error(`Failed to parse resume: ${errorMessage}`);
  }
};

/**
 * Extract skills from text
 */
export const extractSkills = async (text) => {
  try {
    const response = await aiServiceClient.post('/api/parse/extract-skills', {
      text
    });

    return response.data;
  } catch (error) {
    logger.error('Skill extraction error:', error.message);
    throw new Error(`Failed to extract skills: ${error.message}`);
  }
};

/**
 * Generate embedding for text
 */
export const generateEmbedding = async (text) => {
  try {
    const response = await aiServiceClient.post('/api/embeddings/generate', {
      text
    });

    return response.data;
  } catch (error) {
    logger.error('Embedding generation error:', error.message);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
};

/**
 * Generate embeddings for multiple texts
 */
export const generateEmbeddingsBatch = async (texts) => {
  try {
    const response = await aiServiceClient.post('/api/embeddings/batch', {
      texts
    });

    return response.data;
  } catch (error) {
    logger.error('Batch embedding generation error:', error.message);
    throw new Error(`Failed to generate batch embeddings: ${error.message}`);
  }
};

/**
 * Rank candidates against job description
 */
export const rankCandidates = async (jobDescription, resumes, topN = 10) => {
  try {
    const response = await aiServiceClient.post('/api/search/rank-candidates', {
      job_description: jobDescription,
      resumes: resumes.map(r => ({
        id: r.id || r._id.toString(),
        text: r.text || r.rawText || r.parsedData?.rawText || ''
      })),
      top_n: topN
    });

    return response.data;
  } catch (error) {
    logger.error('Candidate ranking error:', error.message);
    throw new Error(`Failed to rank candidates: ${error.message}`);
  }
};

/**
 * Calculate Match Score (Job Fit Score)
 * 
 * PURPOSE: Evaluates how well a resume MATCHES a specific job's requirements
 * WHEN: Calculated when comparing a resume to a job posting
 * RANGE: 0-100%
 * 
 * THIS IS NOT AN ATS SCORE!
 * Match Score measures:
 * - Skills alignment with job requirements
 * - Experience relevance to the role
 * - Education fit for the position
 * - Overall candidate-to-job compatibility
 * 
 * SCORING MODES (configured in AI service):
 * - rule_based: Fast, free, deterministic skill/experience matching
 * - hybrid: Rule-based for scores <70%, LLM enhancement for scores >=70%
 * - llm_only: Full AI-powered analysis (slower, more accurate, uses API credits)
 * 
 * For resume quality scoring, see: calculateATSScore() in resumeService.js
 */
export const calculateMatchScore = async (resumeText, jobDescription, resumeId, jobId) => {
  try {
    // Validate inputs
    if (!resumeText || resumeText.trim().length === 0) {
      throw new Error('Resume text is empty or missing');
    }
    
    if (!jobDescription || jobDescription.trim().length === 0) {
      throw new Error('Job description is empty or missing');
    }

    logger.info('Calculating match score:', {
      resumeId,
      jobId,
      resumeLength: resumeText.length,
      jobDescLength: jobDescription.length
    });

    const response = await aiServiceClient.post('/api/score/match', {
      resume_text: resumeText,
      job_description: jobDescription,
      resume_id: resumeId,
      job_id: jobId,
      include_explanation: true
    });

    logger.info('Match score response:', {
      success: response.data?.success,
      hasMatch: !!response.data?.match,
      score: response.data?.match?.score?.overall_score
    });

    return response.data;
  } catch (error) {
    // Enhanced error logging
    if (error.response) {
      logger.error('Match score API error:', {
        status: error.response.status,
        data: error.response.data,
        message: error.message
      });
      throw new Error(`AI Service error (${error.response.status}): ${error.response.data?.error || error.message}`);
    } else if (error.request) {
      logger.error('AI Service not responding:', {
        message: error.message,
        code: error.code
      });
      throw new Error('AI Service is not responding. Please ensure it is running.');
    } else {
      logger.error('Match score calculation error:', error.message);
      throw new Error(`Failed to calculate match score: ${error.message}`);
    }
  }
};

/**
 * Analyze skill overlap
 */
export const analyzeSkillOverlap = async (resumeSkills, jobSkills) => {
  try {
    const response = await aiServiceClient.post('/api/score/skill-overlap', {
      resume_skills: resumeSkills,
      job_skills: jobSkills
    });

    return response.data;
  } catch (error) {
    logger.error('Skill overlap analysis error:', error.message);
    throw new Error(`Failed to analyze skill overlap: ${error.message}`);
  }
};

/**
 * Generate interview kit
 */
export const generateInterviewKit = async (jobDescription, resumeText, jobTitle, candidateName, numQuestions = 10) => {
  try {
    const response = await aiServiceClient.post('/api/interview/generate', {
      job_description: jobDescription,
      resume_text: resumeText,
      job_title: jobTitle,
      candidate_name: candidateName,
      num_questions: numQuestions
    }, {
      timeout: 120000 // Increased to 120 seconds for interview generation
    });

    return response.data;
  } catch (error) {
    logger.error('Interview kit generation error:', error.message);
    throw new Error(`Failed to generate interview kit: ${error.message}`);
  }
};

/**
 * Add resume to search index
 */
export const addResumeToIndex = async (resumeId, resumeText) => {
  try {
    const response = await aiServiceClient.post('/api/search/add-resume', {
      resume_id: resumeId,
      resume_text: resumeText
    });

    return response.data;
  } catch (error) {
    logger.error('Add resume to index error:', error.message);
    // Don't throw - this is non-critical
    return { success: false, error: error.message };
  }
};

/**
 * Get vector store statistics
 */
export const getVectorStats = async () => {
  try {
    const response = await aiServiceClient.get('/api/search/vector-stats');
    return response.data;
  } catch (error) {
    logger.error('Vector stats error:', error.message);
    throw new Error(`Failed to get vector stats: ${error.message}`);
  }
};

export default {
  checkAIServiceHealth,
  parseResume,
  extractSkills,
  generateEmbedding,
  generateEmbeddingsBatch,
  rankCandidates,
  calculateMatchScore,
  analyzeSkillOverlap,
  generateInterviewKit,
  addResumeToIndex,
  getVectorStats
};
