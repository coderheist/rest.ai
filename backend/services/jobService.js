import Job from '../models/Job.js';
import { incrementUsage } from './usageService.js';

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
   * Get a single job by ID
   */
  async getJobById(jobId, tenantId) {
    try {
      const job = await Job.findOne({ _id: jobId, tenantId })
        .populate('createdBy', 'name email');

      if (!job) {
        throw new Error('Job not found');
      }

      // Increment view count
      await job.incrementViews();

      return job;
    } catch (error) {
      throw new Error(`Failed to fetch job: ${error.message}`);
    }
  }

  /**
   * Update a job
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

      return job;
    } catch (error) {
      throw new Error(`Failed to update job: ${error.message}`);
    }
  }

  /**
   * Delete a job
   */
  async deleteJob(jobId, tenantId) {
    try {
      const job = await Job.findOneAndDelete({ _id: jobId, tenantId });

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
}

export default new JobService();
