import mongoose from 'mongoose';

/**
 * USAGE SCHEMA
 * Purpose: Track resource consumption for billing and plan enforcement
 * Critical for: Monetization, cost control, feature gating
 * 
 * This enables usage-based billing and plan limit enforcement
 */
const usageSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required'],
    index: true
  },
  
  // Resume Processing
  resumesProcessed: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Job Management
  jobsCreated: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // AI Operations (costly resources)
  interviewKitsGenerated: {
    type: Number,
    default: 0,
    min: 0
  },
  
  embeddingCalls: {
    type: Number,
    default: 0,
    min: 0
  },
  
  llmCalls: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // AI Cost Tracking (for premium billing)
  llmTokensUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  
  estimatedCostUSD: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Billing Period
  periodStart: {
    type: Date,
    required: true,
    default: () => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  },
  
  periodEnd: {
    type: Date,
    required: true,
    default: () => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }
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
  collection: 'usage'
});

// Compound indexes for efficient queries
usageSchema.index({ tenantId: 1, periodStart: 1, periodEnd: 1 }, { unique: true });
usageSchema.index({ periodEnd: 1 });

// Static method: Get current usage for tenant
usageSchema.statics.getCurrentUsage = async function(tenantId) {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  let usage = await this.findOne({
    tenantId,
    periodStart,
    periodEnd
  });
  
  // Create new usage record if doesn't exist
  if (!usage) {
    usage = await this.create({
      tenantId,
      periodStart,
      periodEnd
    });
  }
  
  return usage;
};

// Instance method: Increment counter
usageSchema.methods.incrementCounter = async function(counterName, amount = 1) {
  if (this[counterName] !== undefined) {
    this[counterName] += amount;
    this.updatedAt = new Date();
    await this.save();
  }
};

// Instance method: Check if limit exceeded
usageSchema.methods.hasExceededLimit = async function(limitType) {
  const Tenant = mongoose.model('Tenant');
  const tenant = await Tenant.findById(this.tenantId);
  
  if (!tenant) return true;
  
  // Enterprise/unlimited check
  if (tenant[`${limitType}Limit`] === -1) return false;
  
  const mapping = {
    resume: 'resumesProcessed',
    jd: 'jobsCreated',
    aiUsage: 'llmCalls'
  };
  
  const usageField = mapping[limitType];
  const limitField = `${limitType}Limit`;
  
  return this[usageField] >= tenant[limitField];
};

// Static method: Get usage summary for billing
usageSchema.statics.getUsageSummary = async function(tenantId, startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        tenantId: new mongoose.Types.ObjectId(tenantId),
        periodStart: { $gte: startDate },
        periodEnd: { $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$tenantId',
        totalResumes: { $sum: '$resumesProcessed' },
        totalJobs: { $sum: '$jobsCreated' },
        totalInterviewKits: { $sum: '$interviewKitsGenerated' },
        totalLLMCalls: { $sum: '$llmCalls' },
        totalCost: { $sum: '$estimatedCostUSD' }
      }
    }
  ]);
};

const Usage = mongoose.model('Usage', usageSchema);

export default Usage;
