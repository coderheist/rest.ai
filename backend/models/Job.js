import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  department: {
    type: String,
    trim: true,
    maxlength: 100
  },
  location: {
    type: {
      type: String,
      enum: ['remote', 'onsite', 'hybrid'],
      default: 'onsite'
    },
    city: String,
    state: String,
    country: String
  },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'temporary'],
    default: 'full-time'
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
    default: 'mid'
  },
  experienceYears: {
    min: {
      type: Number,
      min: 0,
      default: 0
    },
    max: {
      type: Number,
      min: 0
    }
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    period: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'yearly'
    }
  },
  skills: {
    required: [{
      type: String,
      trim: true
    }],
    preferred: [{
      type: String,
      trim: true
    }]
  },
  responsibilities: [{
    type: String,
    trim: true
  }],
  qualifications: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'closed', 'archived'],
    default: 'draft'
  },
  applicantsCount: {
    type: Number,
    default: 0
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  deadline: {
    type: Date
  },
  metadata: {
    industry: String,
    workSchedule: String,
    travelRequired: Boolean,
    securityClearance: Boolean,
    visaSponsorship: Boolean
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
jobSchema.index({ tenantId: 1, status: 1 });
jobSchema.index({ tenantId: 1, createdAt: -1 });
jobSchema.index({ title: 'text', description: 'text' });

// Virtual for days since posted
jobSchema.virtual('daysPosted').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Check if deadline has passed
jobSchema.virtual('isExpired').get(function() {
  return this.deadline && this.deadline < new Date();
});

// Pre-save middleware
jobSchema.pre('save', function(next) {
  // Auto-close if deadline passed
  if (this.isExpired && this.status === 'active') {
    this.status = 'closed';
  }
  next();
});

// Instance methods
jobSchema.methods.incrementViews = async function() {
  this.viewsCount += 1;
  return this.save();
};

jobSchema.methods.incrementApplicants = async function() {
  this.applicantsCount += 1;
  return this.save();
};

// Static methods
jobSchema.statics.findByTenant = function(tenantId, filter = {}) {
  return this.find({ tenantId, ...filter }).sort({ createdAt: -1 });
};

jobSchema.statics.getActiveJobs = function(tenantId) {
  return this.find({ 
    tenantId, 
    status: 'active',
    $or: [
      { deadline: { $gte: new Date() } },
      { deadline: null }
    ]
  }).sort({ createdAt: -1 });
};

jobSchema.statics.getJobStats = async function(tenantId) {
  const stats = await this.aggregate([
    { $match: { tenantId: new mongoose.Types.ObjectId(tenantId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalApplicants: { $sum: '$applicantsCount' },
        totalViews: { $sum: '$viewsCount' }
      }
    }
  ]);
  
  return stats;
};

const Job = mongoose.model('Job', jobSchema);

export default Job;
