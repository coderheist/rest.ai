import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
    index: true
  },
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
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer between 1 and 5'
    }
  },
  feedback: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  stage: {
    type: String,
    enum: ['screening', 'phone_screen', 'technical', 'behavioral', 'final', 'offer'],
    default: 'screening'
  },
  strengths: [{
    type: String,
    trim: true
  }],
  weaknesses: [{
    type: String,
    trim: true
  }],
  recommendation: {
    type: String,
    enum: ['strong_hire', 'hire', 'maybe', 'no_hire', 'strong_no_hire'],
    required: true
  },
  technicalSkills: {
    rating: { type: Number, min: 1, max: 5 },
    notes: String
  },
  communication: {
    rating: { type: Number, min: 1, max: 5 },
    notes: String
  },
  cultureFit: {
    rating: { type: Number, min: 1, max: 5 },
    notes: String
  },
  problemSolving: {
    rating: { type: Number, min: 1, max: 5 },
    notes: String
  },
  isConfidential: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ tenantId: 1, matchId: 1, createdAt: -1 });
reviewSchema.index({ tenantId: 1, jobId: 1, rating: -1 });
reviewSchema.index({ tenantId: 1, resumeId: 1, rating: -1 });
reviewSchema.index({ tenantId: 1, reviewerId: 1, createdAt: -1 });

// Virtual: Overall impression
reviewSchema.virtual('overallImpression').get(function() {
  if (this.rating >= 4) return 'Excellent';
  if (this.rating === 3) return 'Good';
  if (this.rating === 2) return 'Fair';
  return 'Poor';
});

// Static methods
reviewSchema.statics.getAverageRating = async function(matchId, tenantId) {
  const result = await this.aggregate([
    { $match: { matchId, tenantId } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
        avgTechnical: { $avg: '$technicalSkills.rating' },
        avgCommunication: { $avg: '$communication.rating' },
        avgCultureFit: { $avg: '$cultureFit.rating' },
        avgProblemSolving: { $avg: '$problemSolving.rating' }
      }
    }
  ]);

  if (result.length === 0) {
    return {
      avgRating: 0,
      count: 0,
      avgTechnical: 0,
      avgCommunication: 0,
      avgCultureFit: 0,
      avgProblemSolving: 0
    };
  }

  return {
    avgRating: Math.round(result[0].avgRating * 10) / 10,
    count: result[0].count,
    avgTechnical: result[0].avgTechnical ? Math.round(result[0].avgTechnical * 10) / 10 : 0,
    avgCommunication: result[0].avgCommunication ? Math.round(result[0].avgCommunication * 10) / 10 : 0,
    avgCultureFit: result[0].avgCultureFit ? Math.round(result[0].avgCultureFit * 10) / 10 : 0,
    avgProblemSolving: result[0].avgProblemSolving ? Math.round(result[0].avgProblemSolving * 10) / 10 : 0
  };
};

reviewSchema.statics.getReviewsByMatch = function(matchId, tenantId) {
  return this.find({ matchId, tenantId })
    .populate('reviewerId', 'name email role')
    .sort({ createdAt: -1 });
};

reviewSchema.statics.getReviewsByJob = function(jobId, tenantId, options = {}) {
  const query = { jobId, tenantId };
  
  if (options.minRating) {
    query.rating = { $gte: options.minRating };
  }

  return this.find(query)
    .populate('reviewerId', 'name email role')
    .populate('resumeId', 'candidateInfo.name fileName')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

reviewSchema.statics.getReviewsByReviewer = function(reviewerId, tenantId, options = {}) {
  return this.find({ reviewerId, tenantId })
    .populate('jobId', 'title department')
    .populate('resumeId', 'candidateInfo.name')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

reviewSchema.statics.getRecommendationDistribution = async function(jobId, tenantId) {
  const distribution = await this.aggregate([
    { $match: { jobId, tenantId } },
    {
      $group: {
        _id: '$recommendation',
        count: { $sum: 1 }
      }
    }
  ]);

  return distribution.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
};

const Review = mongoose.model('Review', reviewSchema);

export default Review;
