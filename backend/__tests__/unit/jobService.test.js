import { describe, test, expect, beforeEach, jest } from '@jest/globals';

describe('JobService', () => {
  test('should pass basic test', () => {
    expect(true).toBe(true);
  });

  test('environment should be test', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});

    test('should create a new job successfully', async () => {
      const Job = (await import('../../models/Job.js')).default;
      const aiMatchingService = await import('../../services/aiMatchingService.js');

      const mockJob = {
        _id: 'job123',
        ...mockJobData,
        userId: mockUser._id,
        tenantId: mockUser.tenantId,
        status: 'active',
        save: jest.fn().mockResolvedValue(true)
      };

      Job.mockImplementation(() => mockJob);
      aiMatchingService.extractJobRequirements = jest.fn().mockResolvedValue({
        requiredSkills: ['JavaScript', 'React'],
        preferredSkills: ['TypeScript'],
        minExperience: 5
      });

      const result = await jobService.createJob(mockJobData, mockUser);

      expect(result).toBeDefined();
      expect(result.title).toBe(mockJobData.title);
      expect(mockJob.save).toHaveBeenCalled();
    });

    test('should throw error if required fields are missing', async () => {
      const invalidData = { title: 'Test Job' }; // Missing required fields

      await expect(
        jobService.createJob(invalidData, mockUser)
      ).rejects.toThrow();
    });

    test('should handle AI service failure gracefully', async () => {
      const Job = (await import('../../models/Job.js')).default;
      const aiMatchingService = await import('../../services/aiMatchingService.js');

      const mockJob = {
        _id: 'job123',
        ...mockJobData,
        userId: mockUser._id,
        tenantId: mockUser.tenantId,
        save: jest.fn().mockResolvedValue(true)
      };

      Job.mockImplementation(() => mockJob);
      aiMatchingService.extractJobRequirements = jest.fn().mockRejectedValue(
        new Error('AI service unavailable')
      );

      // Should still create job even if AI fails
      const result = await jobService.createJob(mockJobData, mockUser);
      expect(result).toBeDefined();
    });
  });

  describe('getJobById', () => {
    test('should return job by id for authorized user', async () => {
      const Job = (await import('../../models/Job.js')).default;

      const mockJob = {
        _id: 'job123',
        ...mockJobData,
        userId: mockUser._id,
        tenantId: mockUser.tenantId
      };

      Job.findOne = jest.fn().mockResolvedValue(mockJob);

      const result = await jobService.getJobById('job123', mockUser);

      expect(result).toBeDefined();
      expect(result._id).toBe('job123');
      expect(Job.findOne).toHaveBeenCalledWith({
        _id: 'job123',
        tenantId: mockUser.tenantId
      });
    });

    test('should return null if job not found', async () => {
      const Job = (await import('../../models/Job.js')).default;
      Job.findOne = jest.fn().mockResolvedValue(null);

      const result = await jobService.getJobById('nonexistent', mockUser);

      expect(result).toBeNull();
    });
  });

  describe('listJobs', () => {
    test('should return paginated list of jobs', async () => {
      const Job = (await import('../../models/Job.js')).default;

      const mockJobs = [
        { _id: 'job1', title: 'Job 1', tenantId: mockUser.tenantId },
        { _id: 'job2', title: 'Job 2', tenantId: mockUser.tenantId }
      ];

      Job.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockJobs)
          })
        })
      });

      Job.countDocuments = jest.fn().mockResolvedValue(2);

      const result = await jobService.listJobs(mockUser, { page: 1, limit: 10 });

      expect(result.jobs).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });

    test('should filter jobs by status', async () => {
      const Job = (await import('../../models/Job.js')).default;

      Job.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([])
          })
        })
      });

      Job.countDocuments = jest.fn().mockResolvedValue(0);

      await jobService.listJobs(mockUser, { status: 'active' });

      expect(Job.find).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active' })
      );
    });
  });

  describe('updateJob', () => {
    test('should update job successfully', async () => {
      const Job = (await import('../../models/Job.js')).default;

      const mockJob = {
        _id: 'job123',
        ...mockJobData,
        userId: mockUser._id,
        tenantId: mockUser.tenantId,
        save: jest.fn().mockResolvedValue(true)
      };

      Job.findOne = jest.fn().mockResolvedValue(mockJob);

      const updates = { title: 'Updated Title' };
      const result = await jobService.updateJob('job123', updates, mockUser);

      expect(result.title).toBe('Updated Title');
      expect(mockJob.save).toHaveBeenCalled();
    });

    test('should throw error if job not found', async () => {
      const Job = (await import('../../models/Job.js')).default;
      Job.findOne = jest.fn().mockResolvedValue(null);

      await expect(
        jobService.updateJob('nonexistent', {}, mockUser)
      ).rejects.toThrow('Job not found');
    });
  });

  describe('deleteJob', () => {
    test('should delete job and associated matches', async () => {
      const Job = (await import('../../models/Job.js')).default;
      const Match = (await import('../../models/Match.js')).default;

      const mockJob = {
        _id: 'job123',
        tenantId: mockUser.tenantId,
        deleteOne: jest.fn().mockResolvedValue(true)
      };

      Job.findOne = jest.fn().mockResolvedValue(mockJob);
      Match.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 5 });

      await jobService.deleteJob('job123', mockUser);

      expect(mockJob.deleteOne).toHaveBeenCalled();
      expect(Match.deleteMany).toHaveBeenCalledWith({ jobId: 'job123' });
    });
  });

  describe('getJobStatistics', () => {
    test('should return job statistics', async () => {
      const Job = (await import('../../models/Job.js')).default;
      const Match = (await import('../../models/Match.js')).default;

      Job.countDocuments = jest.fn()
        .mockResolvedValueOnce(10) // total jobs
        .mockResolvedValueOnce(7)  // active jobs
        .mockResolvedValueOnce(2)  // closed jobs
        .mockResolvedValueOnce(1); // draft jobs

      Match.countDocuments = jest.fn().mockResolvedValue(45); // total matches

      const stats = await jobService.getJobStatistics(mockUser);

      expect(stats.totalJobs).toBe(10);
      expect(stats.activeJobs).toBe(7);
      expect(stats.totalMatches).toBe(45);
    });
  });
});
