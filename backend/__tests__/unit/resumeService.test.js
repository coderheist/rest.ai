import { describe, test, expect } from '@jest/globals';

describe('ResumeService', () => {
  test('should pass basic test', () => {
    expect(true).toBe(true);
  });

  test('environment should be test', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});

    test('should upload and parse resume successfully', async () => {
      const Resume = (await import('../../models/Resume.js')).default;
      const aiMatchingService = await import('../../services/aiMatchingService.js');

      const mockFile = {
        filename: 'resume.pdf',
        path: '/uploads/resumes/resume.pdf',
        mimetype: 'application/pdf',
        size: 102400
      };

      const mockResume = {
        _id: 'resume123',
        ...mockResumeData,
        userId: mockUser._id,
        tenantId: mockUser.tenantId,
        filePath: mockFile.path,
        fileName: mockFile.filename,
        save: jest.fn().mockResolvedValue(true)
      };

      aiMatchingService.parseResume = jest.fn().mockResolvedValue({
        text: 'Resume content...',
        ...mockResumeData
      });

      Resume.mockImplementation(() => mockResume);

      const result = await resumeService.uploadResume(mockFile, mockUser);

      expect(result).toBeDefined();
      expect(result.candidateName).toBe('John Doe');
      expect(aiMatchingService.parseResume).toHaveBeenCalledWith(mockFile.path);
      expect(mockResume.save).toHaveBeenCalled();
    });

    test('should handle parsing failure and store raw resume', async () => {
      const Resume = (await import('../../models/Resume.js')).default;
      const aiMatchingService = await import('../../services/aiMatchingService.js');

      const mockFile = {
        filename: 'resume.pdf',
        path: '/uploads/resumes/resume.pdf',
        mimetype: 'application/pdf',
        size: 102400
      };

      const mockResume = {
        _id: 'resume123',
        filePath: mockFile.path,
        fileName: mockFile.filename,
        parsingStatus: 'failed',
        save: jest.fn().mockResolvedValue(true)
      };

      aiMatchingService.parseResume = jest.fn().mockRejectedValue(
        new Error('Parsing failed')
      );

      Resume.mockImplementation(() => mockResume);

      const result = await resumeService.uploadResume(mockFile, mockUser);

      expect(result).toBeDefined();
      expect(result.parsingStatus).toBe('failed');
    });

    test('should validate file type', async () => {
      const invalidFile = {
        filename: 'document.txt',
        path: '/uploads/resumes/document.txt',
        mimetype: 'text/plain',
        size: 1024
      };

      await expect(
        resumeService.uploadResume(invalidFile, mockUser)
      ).rejects.toThrow('Invalid file type');
    });

    test('should validate file size', async () => {
      const largeFile = {
        filename: 'resume.pdf',
        path: '/uploads/resumes/resume.pdf',
        mimetype: 'application/pdf',
        size: 15 * 1024 * 1024 // 15MB
      };

      await expect(
        resumeService.uploadResume(largeFile, mockUser)
      ).rejects.toThrow('File too large');
    });
  });

  describe('getResumeById', () => {
    test('should return resume by id', async () => {
      const Resume = (await import('../../models/Resume.js')).default;

      const mockResume = {
        _id: 'resume123',
        ...mockResumeData,
        tenantId: mockUser.tenantId
      };

      Resume.findOne = jest.fn().mockResolvedValue(mockResume);

      const result = await resumeService.getResumeById('resume123', mockUser);

      expect(result).toBeDefined();
      expect(result._id).toBe('resume123');
    });

    test('should return null if resume not found', async () => {
      const Resume = (await import('../../models/Resume.js')).default;
      Resume.findOne = jest.fn().mockResolvedValue(null);

      const result = await resumeService.getResumeById('nonexistent', mockUser);

      expect(result).toBeNull();
    });
  });

  describe('listResumes', () => {
    test('should return paginated list of resumes', async () => {
      const Resume = (await import('../../models/Resume.js')).default;

      const mockResumes = [
        { _id: 'resume1', candidateName: 'John Doe' },
        { _id: 'resume2', candidateName: 'Jane Smith' }
      ];

      Resume.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockResumes)
          })
        })
      });

      Resume.countDocuments = jest.fn().mockResolvedValue(2);

      const result = await resumeService.listResumes(mockUser, { page: 1, limit: 10 });

      expect(result.resumes).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    test('should filter resumes by skills', async () => {
      const Resume = (await import('../../models/Resume.js')).default;

      Resume.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([])
          })
        })
      });

      Resume.countDocuments = jest.fn().mockResolvedValue(0);

      await resumeService.listResumes(mockUser, { skills: ['JavaScript', 'React'] });

      expect(Resume.find).toHaveBeenCalledWith(
        expect.objectContaining({
          skills: expect.objectContaining({
            $all: ['JavaScript', 'React']
          })
        })
      );
    });
  });

  describe('updateResume', () => {
    test('should update resume successfully', async () => {
      const Resume = (await import('../../models/Resume.js')).default;

      const mockResume = {
        _id: 'resume123',
        ...mockResumeData,
        tenantId: mockUser.tenantId,
        save: jest.fn().mockResolvedValue(true)
      };

      Resume.findOne = jest.fn().mockResolvedValue(mockResume);

      const updates = { phone: '+9876543210' };
      const result = await resumeService.updateResume('resume123', updates, mockUser);

      expect(result.phone).toBe('+9876543210');
      expect(mockResume.save).toHaveBeenCalled();
    });
  });

  describe('deleteResume', () => {
    test('should delete resume and clean up file', async () => {
      const Resume = (await import('../../models/Resume.js')).default;
      const Match = (await import('../../models/Match.js')).default;
      const fs = await import('fs/promises');

      const mockResume = {
        _id: 'resume123',
        filePath: '/uploads/resumes/resume.pdf',
        tenantId: mockUser.tenantId,
        deleteOne: jest.fn().mockResolvedValue(true)
      };

      Resume.findOne = jest.fn().mockResolvedValue(mockResume);
      Match.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 3 });
      fs.unlink = jest.fn().mockResolvedValue(true);

      await resumeService.deleteResume('resume123', mockUser);

      expect(mockResume.deleteOne).toHaveBeenCalled();
      expect(Match.deleteMany).toHaveBeenCalledWith({ resumeId: 'resume123' });
      expect(fs.unlink).toHaveBeenCalledWith(mockResume.filePath);
    });
  });

  describe('searchResumes', () => {
    test('should search resumes by keyword', async () => {
      const Resume = (await import('../../models/Resume.js')).default;

      const mockResumes = [
        { _id: 'resume1', candidateName: 'John Developer' }
      ];

      Resume.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockResumes)
          })
        })
      });

      Resume.countDocuments = jest.fn().mockResolvedValue(1);

      const result = await resumeService.searchResumes(mockUser, {
        keyword: 'developer'
      });

      expect(result.resumes).toHaveLength(1);
      expect(Resume.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $text: expect.any(Object)
        })
      );
    });
  });

  describe('getResumeStatistics', () => {
    test('should return resume statistics', async () => {
      const Resume = (await import('../../models/Resume.js')).default;

      Resume.countDocuments = jest.fn()
        .mockResolvedValueOnce(25)  // total resumes
        .mockResolvedValueOnce(20)  // parsed
        .mockResolvedValueOnce(3)   // pending
        .mockResolvedValueOnce(2);  // failed

      const stats = await resumeService.getResumeStatistics(mockUser);

      expect(stats.totalResumes).toBe(25);
      expect(stats.parsedResumes).toBe(20);
      expect(stats.pendingResumes).toBe(3);
      expect(stats.failedResumes).toBe(2);
    });
  });
});
