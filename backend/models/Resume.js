import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    index: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // File Information
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    enum: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileUrl: String,

  // Parsing Status
  parsingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  parsingError: String,
  parsedAt: Date,

  // Extracted Text
  rawText: {
    type: String,
    maxlength: 50000
  },

  // Personal Information
  personalInfo: {
    fullName: String,
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    phone: String,
    location: {
      city: String,
      state: String,
      country: String
    },
    linkedIn: String,
    github: String,
    website: String,
    summary: String
  },

  // Work Experience
  experience: [{
    title: String,
    company: String,
    location: String,
    startDate: String,
    endDate: String,
    current: Boolean,
    description: String,
    responsibilities: [String],
    achievements: [String]
  }],

  // Education
  education: [{
    degree: String,
    field: String,
    institution: String,
    location: String,
    startDate: String,
    endDate: String,
    gpa: String,
    achievements: [String]
  }],

  // Skills
  skills: {
    technical: [String],
    soft: [String],
    languages: [String],
    tools: [String],
    certifications: [String]
  },

  // Projects
  projects: [{
    name: String,
    description: String,
    technologies: [String],
    url: String,
    highlights: [String]
  }],

  // Certifications
  certifications: [{
    name: String,
    issuer: String,
    issueDate: String,
    expiryDate: String,
    credentialId: String,
    url: String
  }],

  // Calculated Metrics
  totalExperience: {
    type: Number, // in months
    default: 0
  },

  // AI Analysis
  aiAnalysis: {
    summary: String,
    strengths: [String],
    weaknesses: [String],
    keywords: [String],
    recommendedRoles: [String],
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead', 'executive']
    }
  },

  // Matching Score (if associated with a job)
  // Match Score (Job Fit) - How well resume matches a specific job
  // Calculated by: AI Service (rule-based/hybrid/LLM) when comparing to job
  // Use case: Job matching, candidate ranking for a position
  matchScore: {
    type: Number,
    min: 0,
    max: 100
  },
  matchDetails: {
    skillMatch: Number,
    experienceMatch: Number,
    educationMatch: Number,
    overallFit: String,
    recommendations: [String]
  },

  // ATS Score (Resume Quality) - How good/complete the resume document is
  // Calculated by: Backend during parsing (automatic)
  // Use case: Resume ranking, quality filtering, screening
  atsScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  atsDetails: {
    // Enterprise ATS Scoring (JD-based when job linked)
    keywordMatching: Number,      // 50 points - JD keyword matching
    structureParsing: Number,     // 25 points - Resume structure
    skillRelevance: Number,       // 15 points - Skill frequency/placement
    titleAlignment: Number,       // 10 points - Job title matching
    matchedKeywords: Number,      // Count of matched keywords
    totalKeywords: Number,        // Total keywords from JD
    
    // Legacy Quality-Based Scoring (when no job linked)
    formatScore: Number,          // 20 points - Contact info
    keywordScore: Number,         // 30 points - Skills breadth
    experienceScore: Number,      // 25 points - Work history
    educationScore: Number,       // 15 points - Education
    skillsScore: Number           // 10 points - Skills diversity
  },

  // Status
  status: {
    type: String,
    enum: ['new', 'shortlisted', 'reviewed', 'interviewing', 'rejected', 'offer', 'hired'],
    default: 'new'
  },
  
  // Notes and Tags (Enhanced)
  notes: [{
    text: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  
  // Rejection Details
  rejectionReason: String,
  rejectedAt: Date,
  talentPool: {
    type: Boolean,
    default: false
  },
  
  // Tracking
  viewCount: {
    type: Number,
    default: 0
  },
  lastViewedAt: Date,
  lastViewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
resumeSchema.index({ tenantId: 1, status: 1 });
resumeSchema.index({ tenantId: 1, jobId: 1 });
resumeSchema.index({ tenantId: 1, createdAt: -1 });
resumeSchema.index({ 'personalInfo.email': 1 });
resumeSchema.index({ 'personalInfo.fullName': 'text', rawText: 'text' });

// Virtual for experience years
resumeSchema.virtual('experienceYears').get(function() {
  return Math.floor(this.totalExperience / 12);
});

// Virtual for file extension
resumeSchema.virtual('fileExtension').get(function() {
  return this.fileName.split('.').pop().toLowerCase();
});

// Pre-save middleware to calculate total experience
resumeSchema.pre('save', function(next) {
  if (this.experience && this.experience.length > 0) {
    let totalMonths = 0;
    
    this.experience.forEach(exp => {
      if (exp.startDate) {
        const start = new Date(exp.startDate);
        const end = exp.current || !exp.endDate ? new Date() : new Date(exp.endDate);
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        totalMonths += Math.max(0, months);
      }
    });
    
    this.totalExperience = totalMonths;
  }
  next();
});

// Instance methods
resumeSchema.methods.incrementViews = async function(userId) {
  this.viewCount += 1;
  this.lastViewedAt = new Date();
  if (userId) {
    this.lastViewedBy = userId;
  }
  return this.save();
};

resumeSchema.methods.updateStatus = async function(newStatus) {
  this.status = newStatus;
  return this.save();
};

// Static methods
resumeSchema.statics.findByTenant = function(tenantId, filter = {}) {
  return this.find({ tenantId, ...filter })
    .populate('jobId', 'title')
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 });
};

resumeSchema.statics.findByJob = function(jobId) {
  return this.find({ jobId })
    .populate('uploadedBy', 'name email')
    .sort({ matchScore: -1, createdAt: -1 });
};

resumeSchema.statics.searchResumes = function(tenantId, query) {
  return this.find({
    tenantId,
    $or: [
      { 'personalInfo.fullName': new RegExp(query, 'i') },
      { 'personalInfo.email': new RegExp(query, 'i') },
      { 'skills.technical': new RegExp(query, 'i') },
      { rawText: new RegExp(query, 'i') }
    ]
  })
  .populate('jobId', 'title')
  .sort({ createdAt: -1 });
};

resumeSchema.statics.getResumeStats = async function(tenantId, jobId = null) {
  const match = jobId ? { tenantId, jobId } : { tenantId };
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgMatchScore: { $avg: '$matchScore' }
      }
    }
  ]);
  
  const total = await this.countDocuments(match);
  const parsed = await this.countDocuments({ ...match, parsingStatus: 'completed' });
  
  return {
    total,
    parsed,
    statusBreakdown: stats
  };
};

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;
