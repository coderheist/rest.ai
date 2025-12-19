import Resume from '../models/Resume.js';
import { incrementUsage } from './usageService.js';
import { deleteFile, getFileUrl } from '../middleware/upload.js';
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

      // Call AI service (Note: AI service integration will be completed in next phase)
      // For now, we'll set basic parsing status
      // TODO: Implement actual AI parsing
      
      // TODO: Replace with actual AI service call when AI service is ready
      // const response = await axios.post(
      //   `${AI_SERVICE_URL}/api/parse/resume`,
      //   formData,
      //   {
      //     headers: formData.getHeaders(),
      //     timeout: 60000
      //   }
      // );

      // For now, mark as completed with basic info
      resume.rawText = `Resume file: ${resume.fileName}`;
      resume.personalInfo = {
        fullName: 'Pending AI Parsing',
        email: '',
        phone: ''
      };
      resume.skills = {
        technical: [],
        soft: [],
        languages: [],
        tools: [],
        certifications: []
      };
      resume.experience = [];
      resume.education = [];
      resume.projects = [];
      resume.certifications = [];
      resume.parsingStatus = 'completed';
      resume.parsedAt = new Date();
      resume.parsingError = null;

      await resume.save();

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
   * Get resumes by job
   */
  async getResumesByJob(jobId, tenantId) {
    try {
      const resumes = await Resume.find({ jobId, tenantId })
        .populate('uploadedBy', 'name email')
        .sort({ matchScore: -1, createdAt: -1 });

      return resumes;
    } catch (error) {
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
}

export default new ResumeService();
