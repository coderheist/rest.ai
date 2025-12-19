import Job from '../models/Job.js';
import Resume from '../models/Resume.js';
import Match from '../models/Match.js';
import Usage from '../models/Usage.js';
import Note from '../models/Note.js';

export const getDashboardStats = async (tenantId) => {
  const [
    totalJobs,
    activeJobs,
    totalResumes,
    totalMatches,
    shortlistedCount
  ] = await Promise.all([
    Job.countDocuments({ tenantId }),
    Job.countDocuments({ tenantId, status: 'active' }),
    Resume.countDocuments({ tenantId }),
    Match.countDocuments({ tenantId }),
    Match.countDocuments({ tenantId, isShortlisted: true })
  ]);

  // Get match quality distribution
  const matchDistribution = await Match.aggregate([
    { $match: { tenantId } },
    {
      $bucket: {
        groupBy: '$overallScore',
        boundaries: [0, 40, 60, 80, 100],
        default: 'other',
        output: {
          count: { $sum: 1 },
          avgScore: { $avg: '$overallScore' }
        }
      }
    }
  ]);

  return {
    totalJobs,
    activeJobs,
    totalResumes,
    totalMatches,
    shortlistedCount,
    matchDistribution: matchDistribution.map(bucket => ({
      range: `${bucket._id}-${bucket._id + 20}`,
      count: bucket.count,
      avgScore: Math.round(bucket.avgScore)
    }))
  };
};

export const getCandidatePipeline = async (tenantId) => {
  const pipeline = await Match.aggregate([
    { $match: { tenantId, overallScore: { $gte: 60 } } },
    {
      $lookup: {
        from: 'resumes',
        localField: 'resumeId',
        foreignField: '_id',
        as: 'resume'
      }
    },
    {
      $lookup: {
        from: 'jobs',
        localField: 'jobId',
        foreignField: '_id',
        as: 'job'
      }
    },
    { $unwind: '$resume' },
    { $unwind: '$job' },
    {
      $group: {
        _id: '$job.status',
        count: { $sum: 1 },
        candidates: {
          $push: {
            matchId: '$_id',
            candidateName: '$resume.candidateInfo.name',
            jobTitle: '$job.title',
            score: '$overallScore',
            isShortlisted: '$isShortlisted'
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return pipeline.map(stage => ({
    stage: stage._id || 'screening',
    count: stage.count,
    topCandidates: stage.candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  }));
};

export const getRecentActivities = async (tenantId, limit = 20) => {
  const [recentJobs, recentResumes, recentMatches, recentNotes] = await Promise.all([
    Job.find({ tenantId })
      .select('title status createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Resume.find({ tenantId })
      .select('candidateInfo.name fileName createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Match.find({ tenantId })
      .populate('jobId', 'title')
      .populate('resumeId', 'candidateInfo.name')
      .select('overallScore isShortlisted createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Note.find({ tenantId })
      .populate('userId', 'name')
      .select('content relatedTo createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
  ]);

  // Combine and format activities
  const activities = [
    ...recentJobs.map(job => ({
      type: 'job',
      action: 'created',
      title: `New job posted: ${job.title}`,
      timestamp: job.createdAt,
      metadata: { status: job.status }
    })),
    ...recentResumes.map(resume => ({
      type: 'resume',
      action: 'uploaded',
      title: `Resume uploaded: ${resume.candidateInfo?.name || resume.fileName}`,
      timestamp: resume.createdAt
    })),
    ...recentMatches.map(match => ({
      type: 'match',
      action: match.isShortlisted ? 'shortlisted' : 'matched',
      title: `${match.resumeId?.candidateInfo?.name || 'Candidate'} matched with ${match.jobId?.title || 'Job'} (${match.overallScore}%)`,
      timestamp: match.createdAt,
      metadata: { score: match.overallScore }
    })),
    ...recentNotes.map(note => ({
      type: 'note',
      action: 'added',
      title: `${note.userId?.name || 'User'} added a note`,
      timestamp: note.createdAt,
      metadata: { preview: note.content.substring(0, 50) }
    }))
  ];

  // Sort by timestamp and limit
  return activities
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
};

export const getJobAnalytics = async (tenantId, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const jobTrends = await Job.aggregate([
    {
      $match: {
        tenantId,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const resumeTrends = await Resume.aggregate([
    {
      $match: {
        tenantId,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const matchTrends = await Match.aggregate([
    {
      $match: {
        tenantId,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 },
        avgScore: { $avg: '$overallScore' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return {
    jobTrends: jobTrends.map(t => ({ date: t._id, count: t.count })),
    resumeTrends: resumeTrends.map(t => ({ date: t._id, count: t.count })),
    matchTrends: matchTrends.map(t => ({ 
      date: t._id, 
      count: t.count,
      avgScore: Math.round(t.avgScore)
    }))
  };
};

export const getTopPerformingJobs = async (tenantId, limit = 5) => {
  const topJobs = await Match.aggregate([
    { $match: { tenantId, overallScore: { $gte: 70 } } },
    {
      $lookup: {
        from: 'jobs',
        localField: 'jobId',
        foreignField: '_id',
        as: 'job'
      }
    },
    { $unwind: '$job' },
    {
      $group: {
        _id: '$jobId',
        jobTitle: { $first: '$job.title' },
        matchCount: { $sum: 1 },
        avgScore: { $avg: '$overallScore' },
        shortlistedCount: {
          $sum: { $cond: ['$isShortlisted', 1, 0] }
        }
      }
    },
    { $sort: { matchCount: -1, avgScore: -1 } },
    { $limit: limit }
  ]);

  return topJobs.map(job => ({
    jobId: job._id,
    jobTitle: job.jobTitle,
    matchCount: job.matchCount,
    avgScore: Math.round(job.avgScore),
    shortlistedCount: job.shortlistedCount
  }));
};

export const getUsageAnalytics = async (tenantId) => {
  const usage = await Usage.findOne({ tenantId }).lean();
  
  if (!usage) {
    return {
      currentPeriod: {
        resumes: 0,
        matches: 0,
        jobs: 0,
        llmCalls: 0
      },
      limits: {
        resumes: 100,
        matches: 500,
        jobs: 50,
        llmCalls: 1000
      },
      utilizationPercent: {
        resumes: 0,
        matches: 0,
        jobs: 0,
        llmCalls: 0
      }
    };
  }

  const currentPeriod = usage.currentPeriod || {};
  const limits = usage.limits || {};

  return {
    currentPeriod: {
      resumes: currentPeriod.resumeUploads || 0,
      matches: currentPeriod.matchesGenerated || 0,
      jobs: currentPeriod.jobsPosted || 0,
      llmCalls: currentPeriod.llmCalls || 0
    },
    limits: {
      resumes: limits.resumeUploads || 100,
      matches: limits.matchesGenerated || 500,
      jobs: limits.jobsPosted || 50,
      llmCalls: limits.llmCalls || 1000
    },
    utilizationPercent: {
      resumes: Math.round(((currentPeriod.resumeUploads || 0) / (limits.resumeUploads || 100)) * 100),
      matches: Math.round(((currentPeriod.matchesGenerated || 0) / (limits.matchesGenerated || 500)) * 100),
      jobs: Math.round(((currentPeriod.jobsPosted || 0) / (limits.jobsPosted || 50)) * 100),
      llmCalls: Math.round(((currentPeriod.llmCalls || 0) / (limits.llmCalls || 1000)) * 100)
    }
  };
};
