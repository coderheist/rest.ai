import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  // Multi-tenant isolation
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },

  // Related entities
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },

  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
    index: true
  },

  // Overall match score (0-100)
  overallScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    index: true
  },

  // Component scores
  skillMatch: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    matchedSkills: [{
      skill: String,
      confidence: Number,
      source: {
        type: String,
        enum: ['exact', 'semantic', 'inferred']
      }
    }],
    missingSkills: [String],
    additionalSkills: [String]
  },

  experienceMatch: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    requiredYears: Number,
    candidateYears: Number,
    relevant: Boolean,
    details: String
  },

  educationMatch: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    meets: Boolean,
    details: String
  },

  // Semantic similarity (cosine similarity from embeddings)
  semanticSimilarity: {
    type: Number,
    min: 0,
    max: 1
  },

  // AI-generated explanations
  strengths: [String],
  concerns: [String],
  recommendation: {
    type: String,
    enum: ['strong_match', 'good_match', 'potential_match', 'weak_match', 'not_recommended']
  },

  // Detailed reasoning
  aiReasoning: String,

  // Match status
  status: {
    type: String,
    enum: ['pending', 'completed', 'reviewed', 'rejected'],
    default: 'completed'
  },

  // Metadata
  calculatedAt: {
    type: Date,
    default: Date.now
  },

  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  reviewedAt: Date,

  reviewNotes: String,

  // Ranking info
  rank: Number

}, {
  timestamps: true
});

// Compound indexes
matchSchema.index({ tenantId: 1, jobId: 1, overallScore: -1 });
matchSchema.index({ tenantId: 1, resumeId: 1 });
matchSchema.index({ tenantId: 1, status: 1, overallScore: -1 });

// Prevent duplicate matches
matchSchema.index({ tenantId: 1, jobId: 1, resumeId: 1 }, { unique: true });

// Virtual: Match quality label
matchSchema.virtual('qualityLabel').get(function() {
  if (this.overallScore >= 80) return 'Excellent';
  if (this.overallScore >= 70) return 'Very Good';
  if (this.overallScore >= 60) return 'Good';
  if (this.overallScore >= 50) return 'Fair';
  return 'Poor';
});

// Instance methods

/**
 * Update match status
 */
matchSchema.methods.updateStatus = async function(status, userId, notes) {
  this.status = status;
  if (userId) {
    this.reviewedBy = userId;
    this.reviewedAt = new Date();
  }
  if (notes) {
    this.reviewNotes = notes;
  }
  await this.save();
  return this;
};

// Static methods

/**
 * Find all matches for a job, sorted by score
 */
matchSchema.statics.findByJob = async function(jobId, tenantId, options = {}) {
  const {
    minScore = 0,
    status = null,
    limit = 100,
    skip = 0
  } = options;

  const query = {
    jobId: new mongoose.Types.ObjectId(jobId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
    overallScore: { $gte: minScore }
  };

  if (status) {
    query.status = status;
  }

  return this.find(query)
    .populate('resumeId', 'fileName personalInfo skills experience education')
    .sort({ overallScore: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * Find all matches for a resume
 */
matchSchema.statics.findByResume = async function(resumeId, tenantId, options = {}) {
  const {
    minScore = 0,
    limit = 50
  } = options;

  return this.find({
    resumeId: new mongoose.Types.ObjectId(resumeId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
    overallScore: { $gte: minScore }
  })
    .populate('jobId', 'title company location department')
    .sort({ overallScore: -1 })
    .limit(limit);
};

/**
 * Get match statistics for a job
 */
matchSchema.statics.getJobStats = async function(jobId, tenantId) {
  const matches = await this.find({
    jobId: new mongoose.Types.ObjectId(jobId),
    tenantId: new mongoose.Types.ObjectId(tenantId)
  });

  if (matches.length === 0) {
    return {
      totalMatches: 0,
      averageScore: 0,
      distribution: { excellent: 0, veryGood: 0, good: 0, fair: 0, poor: 0 }
    };
  }

  const totalScore = matches.reduce((sum, m) => sum + m.overallScore, 0);
  const distribution = matches.reduce((acc, m) => {
    if (m.overallScore >= 80) acc.excellent++;
    else if (m.overallScore >= 70) acc.veryGood++;
    else if (m.overallScore >= 60) acc.good++;
    else if (m.overallScore >= 50) acc.fair++;
    else acc.poor++;
    return acc;
  }, { excellent: 0, veryGood: 0, good: 0, fair: 0, poor: 0 });

  return {
    totalMatches: matches.length,
    averageScore: Math.round(totalScore / matches.length),
    distribution,
    bestMatch: matches.reduce((best, m) => m.overallScore > best.overallScore ? m : best),
    topCandidates: matches
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 5)
  };
};

/**
 * Calculate and assign ranks for a job's matches
 */
matchSchema.statics.updateRankings = async function(jobId, tenantId) {
  const matches = await this.find({
    jobId: new mongoose.Types.ObjectId(jobId),
    tenantId: new mongoose.Types.ObjectId(tenantId)
  }).sort({ overallScore: -1 });

  for (let i = 0; i < matches.length; i++) {
    matches[i].rank = i + 1;
    await matches[i].save();
  }

  return matches.length;
};

/**
 * Get top matches across all jobs for a tenant
 */
matchSchema.statics.getTopMatches = async function(tenantId, limit = 20) {
  return this.find({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    status: 'completed'
  })
    .populate('jobId', 'title company')
    .populate('resumeId', 'fileName personalInfo')
    .sort({ overallScore: -1 })
    .limit(limit);
};

/**
 * Search matches with filters
 */
matchSchema.statics.searchMatches = async function(tenantId, filters = {}) {
  const query = { tenantId: new mongoose.Types.ObjectId(tenantId) };

  if (filters.jobId) {
    query.jobId = new mongoose.Types.ObjectId(filters.jobId);
  }

  if (filters.minScore) {
    query.overallScore = { $gte: filters.minScore };
  }

  if (filters.maxScore) {
    query.overallScore = { ...query.overallScore, $lte: filters.maxScore };
  }

  if (filters.recommendation) {
    query.recommendation = filters.recommendation;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  return this.find(query)
    .populate('jobId', 'title company')
    .populate('resumeId', 'fileName personalInfo')
    .sort({ overallScore: -1 })
    .limit(filters.limit || 100);
};

const Match = mongoose.model('Match', matchSchema);

export default Match;
