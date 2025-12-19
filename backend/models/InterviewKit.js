import mongoose from 'mongoose';

const interviewKitSchema = new mongoose.Schema({
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

  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    index: true
  },

  // Technical Questions
  technicalQuestions: [{
    question: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['coding', 'system_design', 'algorithms', 'database', 'architecture', 'tools', 'other'],
      default: 'other'
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    skillsAssessed: [String],
    expectedAnswer: String,
    evaluationCriteria: [String],
    timeEstimate: {
      type: Number, // in minutes
      default: 15
    }
  }],

  // Behavioral Questions
  behavioralQuestions: [{
    question: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['leadership', 'teamwork', 'problem_solving', 'communication', 'adaptability', 'conflict_resolution', 'other'],
      default: 'other'
    },
    competency: String,
    expectedAnswer: String,
    evaluationCriteria: [String],
    starFramework: {
      situation: String,
      task: String,
      action: String,
      result: String
    }
  }],

  // Situational/Case Questions
  situationalQuestions: [{
    scenario: String,
    question: String,
    expectedApproach: String,
    evaluationPoints: [String]
  }],

  // Overall Evaluation Rubric
  evaluationRubric: {
    technicalSkills: {
      weight: {
        type: Number,
        default: 40
      },
      criteria: [String]
    },
    problemSolving: {
      weight: {
        type: Number,
        default: 30
      },
      criteria: [String]
    },
    communication: {
      weight: {
        type: Number,
        default: 15
      },
      criteria: [String]
    },
    cultureFit: {
      weight: {
        type: Number,
        default: 15
      },
      criteria: [String]
    }
  },

  // Interview Structure
  interviewStructure: {
    duration: {
      type: Number, // total minutes
      default: 60
    },
    sections: [{
      name: String,
      duration: Number,
      description: String
    }]
  },

  // Red Flags & Green Flags
  redFlags: [String],
  greenFlags: [String],

  // Additional Notes
  interviewerNotes: String,
  focusAreas: [String],
  
  // Generation metadata
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  generationStatus: {
    type: String,
    enum: ['pending', 'generating', 'completed', 'failed'],
    default: 'pending'
  },

  generationError: String,

  llmModel: {
    type: String,
    default: 'gemini-1.5-flash'
  },

  tokensUsed: Number,

  // Usage tracking
  viewCount: {
    type: Number,
    default: 0
  },

  lastViewedAt: Date,

  // Export tracking
  exportedAt: Date,
  exportFormat: String

}, {
  timestamps: true
});

// Compound indexes
interviewKitSchema.index({ tenantId: 1, jobId: 1 });
interviewKitSchema.index({ tenantId: 1, resumeId: 1 });
interviewKitSchema.index({ tenantId: 1, createdAt: -1 });

// Prevent duplicate kits
interviewKitSchema.index({ tenantId: 1, jobId: 1, resumeId: 1 }, { unique: true });

// Virtual: Total questions count
interviewKitSchema.virtual('totalQuestions').get(function() {
  return (this.technicalQuestions?.length || 0) + 
         (this.behavioralQuestions?.length || 0) +
         (this.situationalQuestions?.length || 0);
});

// Virtual: Estimated interview duration
interviewKitSchema.virtual('estimatedDuration').get(function() {
  const techTime = this.technicalQuestions?.reduce((sum, q) => sum + (q.timeEstimate || 15), 0) || 0;
  const behavioralTime = this.behavioralQuestions?.length * 10 || 0;
  const situationalTime = this.situationalQuestions?.length * 15 || 0;
  return techTime + behavioralTime + situationalTime;
});

// Instance methods

/**
 * Increment view count
 */
interviewKitSchema.methods.incrementViews = async function() {
  this.viewCount += 1;
  this.lastViewedAt = new Date();
  await this.save();
};

/**
 * Mark as exported
 */
interviewKitSchema.methods.markExported = async function(format) {
  this.exportedAt = new Date();
  this.exportFormat = format;
  await this.save();
};

/**
 * Update generation status
 */
interviewKitSchema.methods.updateStatus = async function(status, error = null) {
  this.generationStatus = status;
  if (error) {
    this.generationError = error;
  }
  await this.save();
};

// Static methods

/**
 * Find interview kits by job
 */
interviewKitSchema.statics.findByJob = async function(jobId, tenantId) {
  return this.find({
    jobId: new mongoose.Types.ObjectId(jobId),
    tenantId: new mongoose.Types.ObjectId(tenantId)
  })
    .populate('resumeId', 'fileName personalInfo')
    .sort({ createdAt: -1 });
};

/**
 * Find interview kit by resume
 */
interviewKitSchema.statics.findByResume = async function(resumeId, tenantId) {
  return this.find({
    resumeId: new mongoose.Types.ObjectId(resumeId),
    tenantId: new mongoose.Types.ObjectId(tenantId)
  })
    .populate('jobId', 'title company')
    .sort({ createdAt: -1 });
};

/**
 * Get interview kit statistics
 */
interviewKitSchema.statics.getStats = async function(tenantId) {
  const kits = await this.find({
    tenantId: new mongoose.Types.ObjectId(tenantId)
  });

  return {
    totalKits: kits.length,
    completedKits: kits.filter(k => k.generationStatus === 'completed').length,
    failedKits: kits.filter(k => k.generationStatus === 'failed').length,
    totalViews: kits.reduce((sum, k) => sum + k.viewCount, 0),
    totalQuestions: kits.reduce((sum, k) => sum + (k.totalQuestions || 0), 0),
    averageQuestionsPerKit: kits.length > 0 
      ? Math.round(kits.reduce((sum, k) => sum + (k.totalQuestions || 0), 0) / kits.length)
      : 0
  };
};

const InterviewKit = mongoose.model('InterviewKit', interviewKitSchema);

export default InterviewKit;
