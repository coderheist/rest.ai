import mongoose from 'mongoose';

/**
 * TENANT SCHEMA
 * Purpose: Multi-tenant SaaS workspace
 * Enables: Team isolation, billing, plan enforcement
 * 
 * This is the root entity for SaaS architecture.
 * Every query is scoped by tenantId for security.
 */
const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tenant name is required'],
    trim: true,
    maxlength: [100, 'Tenant name cannot exceed 100 characters']
  },
  
  plan: {
    type: String,
    enum: {
      values: ['FREE', 'PRO', 'BUSINESS', 'ENTERPRISE'],
      message: '{VALUE} is not a valid plan'
    },
    default: 'FREE',
    required: true
  },
  
  // Plan Limits (enforced by middleware)
  resumeLimit: {
    type: Number,
    default: 50,
    min: 0
  },
  
  jdLimit: {
    type: Number,
    default: 5,
    min: 0
  },
  
  aiUsageLimit: {
    type: Number,
    default: 100,
    min: 0
  },
  
  contactEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'tenants'
});

// Indexes for performance
tenantSchema.index({ plan: 1 });
tenantSchema.index({ isActive: 1 });
tenantSchema.index({ createdAt: -1 });

// Set plan limits based on plan type
tenantSchema.pre('save', function(next) {
  if (this.isModified('plan')) {
    switch(this.plan) {
      case 'FREE':
        this.resumeLimit = 50;
        this.jdLimit = 5;
        this.aiUsageLimit = 100;
        break;
      case 'PRO':
        this.resumeLimit = 500;
        this.jdLimit = 50;
        this.aiUsageLimit = 1000;
        break;
      case 'BUSINESS':
        this.resumeLimit = 2000;
        this.jdLimit = 200;
        this.aiUsageLimit = 5000;
        break;
      case 'ENTERPRISE':
        this.resumeLimit = -1; // unlimited
        this.jdLimit = -1;
        this.aiUsageLimit = -1;
        break;
    }
  }
  next();
});

// Instance methods
tenantSchema.methods.canCreateJob = async function() {
  if (this.jdLimit === -1) return true;
  const Job = mongoose.model('Job');
  const count = await Job.countDocuments({ tenantId: this._id });
  return count < this.jdLimit;
};

tenantSchema.methods.canProcessResume = async function() {
  if (this.resumeLimit === -1) return true;
  const Usage = mongoose.model('Usage');
  const currentUsage = await Usage.findOne({ 
    tenantId: this._id,
    periodEnd: { $gte: new Date() }
  });
  return !currentUsage || currentUsage.resumesProcessed < this.resumeLimit;
};

const Tenant = mongoose.model('Tenant', tenantSchema);

export default Tenant;
