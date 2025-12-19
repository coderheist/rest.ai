import Usage from '../models/Usage.js';
import Tenant from '../models/Tenant.js';

/**
 * Usage Tracking Service
 * Handles all usage counter increments and limit checks
 */

/**
 * Get current usage for tenant
 * @param {String} tenantId - Tenant ID
 * @returns {Object} Usage document
 */
export const getCurrentUsage = async (tenantId) => {
  return await Usage.getCurrentUsage(tenantId);
};

/**
 * Increment usage counter
 * @param {String} tenantId - Tenant ID
 * @param {String} counterName - Counter to increment
 * @param {Number} amount - Amount to increment (default: 1)
 */
export const incrementUsage = async (tenantId, counterName, amount = 1) => {
  const usage = await Usage.getCurrentUsage(tenantId);
  await usage.incrementCounter(counterName, amount);
  return usage;
};

/**
 * Check if tenant has exceeded limit
 * @param {String} tenantId - Tenant ID
 * @param {String} limitType - Type of limit (resume, jd, aiUsage)
 * @returns {Boolean} True if exceeded
 */
export const checkLimit = async (tenantId, limitType) => {
  const tenant = await Tenant.findById(tenantId);
  const usage = await Usage.getCurrentUsage(tenantId);
  
  if (!tenant) return true;
  
  // Unlimited check
  const limitField = `${limitType}Limit`;
  if (tenant[limitField] === -1) return false;
  
  // Map limit type to usage field
  const mapping = {
    resume: { usage: 'resumesProcessed', limit: 'resumeLimit' },
    jd: { usage: 'jobsCreated', limit: 'jdLimit' },
    aiUsage: { usage: 'llmCalls', limit: 'aiUsageLimit' }
  };
  
  const config = mapping[limitType];
  if (!config) return false;
  
  return usage[config.usage] >= tenant[config.limit];
};

/**
 * Get usage with limits for dashboard
 * @param {String} tenantId - Tenant ID
 * @returns {Object} Usage data with limits
 */
export const getUsageWithLimits = async (tenantId) => {
  const tenant = await Tenant.findById(tenantId);
  const usage = await Usage.getCurrentUsage(tenantId);
  
  return {
    current: {
      resumesProcessed: usage.resumesProcessed,
      jobsCreated: usage.jobsCreated,
      interviewKitsGenerated: usage.interviewKitsGenerated,
      embeddingCalls: usage.embeddingCalls,
      llmCalls: usage.llmCalls,
      llmTokensUsed: usage.llmTokensUsed,
      estimatedCostUSD: usage.estimatedCostUSD
    },
    limits: {
      resumeLimit: tenant.resumeLimit,
      jdLimit: tenant.jdLimit,
      aiUsageLimit: tenant.aiUsageLimit
    },
    period: {
      start: usage.periodStart,
      end: usage.periodEnd
    },
    percentUsed: {
      resumes: tenant.resumeLimit > 0 
        ? Math.round((usage.resumesProcessed / tenant.resumeLimit) * 100) 
        : 0,
      jobs: tenant.jdLimit > 0 
        ? Math.round((usage.jobsCreated / tenant.jdLimit) * 100) 
        : 0,
      aiUsage: tenant.aiUsageLimit > 0 
        ? Math.round((usage.llmCalls / tenant.aiUsageLimit) * 100) 
        : 0
    }
  };
};

/**
 * Track AI cost
 * @param {String} tenantId - Tenant ID
 * @param {Number} tokens - Number of tokens used
 * @param {Number} cost - Cost in USD
 */
export const trackAICost = async (tenantId, tokens, cost) => {
  const usage = await Usage.getCurrentUsage(tenantId);
  usage.llmTokensUsed += tokens;
  usage.estimatedCostUSD += cost;
  await usage.save();
};

export default {
  getCurrentUsage,
  incrementUsage,
  checkLimit,
  getUsageWithLimits,
  trackAICost
};
