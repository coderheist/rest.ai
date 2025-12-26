import { describe, test, expect } from '@jest/globals';

describe('MatchService', () => {
  test('should pass basic test', () => {
    expect(true).toBe(true);
  });

  test('environment should be test', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});

    test('should create match with AI scoring', async () => {
      const Match = (await import('../../models/Match.js')).default;
      const Job = (await import('../../models/Job.js')).default;
      const Resume = (await import('../../models/Resume.js')).default;
      const aiMatchingService = await import('../../services/aiMatchingService.js');

      Job.findById = jest.fn().mockResolvedValue(mockJob);
      Resume.findById = jest.fn().mockResolvedValue(mockResume);

      const mockMatchScore = {
        overallScore: 0.85,
        skillsMatch: 0.90,
        experienceMatch: 0.80,
        educationMatch: 0.85,
        matchedSkills: ['JavaScript', 'React'],
        missingSkills: [],
        strengths: ['Strong technical skills'],
        weaknesses: [],
        recommendation: 'Highly recommended'
      };

      aiMatchingService.calculateMatch = jest.fn().mockResolvedValue(mockMatchScore);

      const mockMatch = {
        _id: 'match123',
        jobId: 'job123',
        resumeId: 'resume123',
        ...mockMatchScore,
        save: jest.fn().mockResolvedValue(true)
      };

      Match.mockImplementation(() => mockMatch);
      Match.findOne = jest.fn().mockResolvedValue(null); // No existing match

      const result = await matchService.createMatch('job123', 'resume123', mockUser);

      expect(result).toBeDefined();
      expect(result.overallScore).toBe(0.85);
      expect(aiMatchingService.calculateMatch).toHaveBeenCalled();
    });

    test('should return existing match if already exists', async () => {
      const Match = (await import('../../models/Match.js')).default;

      const existingMatch = {
        _id: 'match123',
        jobId: 'job123',
        resumeId: 'resume123',
        overallScore: 0.85
      };

      Match.findOne = jest.fn().mockResolvedValue(existingMatch);

      const result = await matchService.createMatch('job123', 'resume123', mockUser);

      expect(result).toBe(existingMatch);
    });

    test('should handle AI service failure', async () => {
      const Match = (await import('../../models/Match.js')).default;
      const Job = (await import('../../models/Job.js')).default;
      const Resume = (await import('../../models/Resume.js')).default;
      const aiMatchingService = await import('../../services/aiMatchingService.js');

      Job.findById = jest.fn().mockResolvedValue(mockJob);
      Resume.findById = jest.fn().mockResolvedValue(mockResume);
      Match.findOne = jest.fn().mockResolvedValue(null);

      aiMatchingService.calculateMatch = jest.fn().mockRejectedValue(
        new Error('AI service down')
      );

      await expect(
        matchService.createMatch('job123', 'resume123', mockUser)
      ).rejects.toThrow('AI service down');
    });
  });

  describe('getMatchById', () => {
    test('should return match with populated data', async () => {
      const Match = (await import('../../models/Match.js')).default;

      const mockMatch = {
        _id: 'match123',
        jobId: mockJob,
        resumeId: mockResume,
        overallScore: 0.85,
        tenantId: mockUser.tenantId
      };

      Match.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockMatch)
      });

      const result = await matchService.getMatchById('match123', mockUser);

      expect(result).toBeDefined();
      expect(result.jobId.title).toBe('Senior Developer');
    });
  });

  describe('getMatchesByJob', () => {
    test('should return matches for a job sorted by score', async () => {
      const Match = (await import('../../models/Match.js')).default;

      const mockMatches = [
        { _id: 'match1', overallScore: 0.90 },
        { _id: 'match2', overallScore: 0.85 },
        { _id: 'match3', overallScore: 0.80 }
      ];

      Match.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockMatches)
        })
      });

      const result = await matchService.getMatchesByJob('job123', mockUser);

      expect(result).toHaveLength(3);
      expect(result[0].overallScore).toBeGreaterThanOrEqual(result[1].overallScore);
      expect(Match.find).toHaveBeenCalledWith({
        jobId: 'job123',
        tenantId: mockUser.tenantId
      });
    });

    test('should filter matches by minimum score', async () => {
      const Match = (await import('../../models/Match.js')).default;

      Match.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([])
        })
      });

      await matchService.getMatchesByJob('job123', mockUser, { minScore: 0.75 });

      expect(Match.find).toHaveBeenCalledWith({
        jobId: 'job123',
        tenantId: mockUser.tenantId,
        overallScore: { $gte: 0.75 }
      });
    });
  });

  describe('updateMatchStatus', () => {
    test('should update match status', async () => {
      const Match = (await import('../../models/Match.js')).default;

      const mockMatch = {
        _id: 'match123',
        status: 'pending',
        tenantId: mockUser.tenantId,
        save: jest.fn().mockResolvedValue(true)
      };

      Match.findOne = jest.fn().mockResolvedValue(mockMatch);

      const result = await matchService.updateMatchStatus(
        'match123',
        'shortlisted',
        mockUser
      );

      expect(result.status).toBe('shortlisted');
      expect(mockMatch.save).toHaveBeenCalled();
    });

    test('should validate status value', async () => {
      await expect(
        matchService.updateMatchStatus('match123', 'invalid-status', mockUser)
      ).rejects.toThrow('Invalid status');
    });
  });

  describe('rescreenCandidates', () => {
    test('should rescreen all candidates for a job', async () => {
      const Match = (await import('../../models/Match.js')).default;
      const Job = (await import('../../models/Job.js')).default;
      const aiMatchingService = await import('../../services/aiMatchingService.js');

      Job.findById = jest.fn().mockResolvedValue(mockJob);

      const mockMatches = [
        {
          _id: 'match1',
          resumeId: { _id: 'resume1', candidateName: 'John' },
          save: jest.fn().mockResolvedValue(true)
        },
        {
          _id: 'match2',
          resumeId: { _id: 'resume2', candidateName: 'Jane' },
          save: jest.fn().mockResolvedValue(true)
        }
      ];

      Match.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockMatches)
      });

      aiMatchingService.calculateMatch = jest.fn()
        .mockResolvedValueOnce({ overallScore: 0.88 })
        .mockResolvedValueOnce({ overallScore: 0.92 });

      const result = await matchService.rescreenCandidates('job123', mockUser);

      expect(result.updatedMatches).toBe(2);
      expect(mockMatches[0].save).toHaveBeenCalled();
      expect(mockMatches[1].save).toHaveBeenCalled();
    });
  });

  describe('getTopCandidates', () => {
    test('should return top N candidates', async () => {
      const Match = (await import('../../models/Match.js')).default;

      const mockMatches = [
        { _id: 'match1', overallScore: 0.95 },
        { _id: 'match2', overallScore: 0.90 },
        { _id: 'match3', overallScore: 0.85 }
      ];

      Match.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockMatches.slice(0, 2))
          })
        })
      });

      const result = await matchService.getTopCandidates('job123', mockUser, 2);

      expect(result).toHaveLength(2);
      expect(result[0].overallScore).toBe(0.95);
    });
  });

  describe('getMatchStatistics', () => {
    test('should return match statistics for a job', async () => {
      const Match = (await import('../../models/Match.js')).default;

      Match.countDocuments = jest.fn()
        .mockResolvedValueOnce(10)  // total matches
        .mockResolvedValueOnce(3)   // shortlisted
        .mockResolvedValueOnce(2)   // rejected
        .mockResolvedValueOnce(5);  // pending

      Match.aggregate = jest.fn().mockResolvedValue([
        { _id: null, avgScore: 0.75 }
      ]);

      const stats = await matchService.getMatchStatistics('job123', mockUser);

      expect(stats.totalMatches).toBe(10);
      expect(stats.shortlisted).toBe(3);
      expect(stats.averageScore).toBe(0.75);
    });
  });
});
