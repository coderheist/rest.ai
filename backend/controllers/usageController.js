import { getUsageWithLimits, incrementUsage } from '../services/usageService.js';

/**
 * @desc    Get current usage stats
 * @route   GET /api/usage
 * @access  Private
 */
export const getUsage = async (req, res, next) => {
  try {
    const usageData = await getUsageWithLimits(req.tenantId);
    
    res.status(200).json({
      success: true,
      data: usageData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Increment usage counter (internal use)
 * @route   POST /api/usage/increment
 * @access  Private
 */
export const incrementUsageCounter = async (req, res, next) => {
  try {
    const { counterName, amount = 1 } = req.body;
    
    if (!counterName) {
      return res.status(400).json({
        success: false,
        error: 'Counter name is required',
        statusCode: 400
      });
    }
    
    const validCounters = [
      'resumesProcessed',
      'jobsCreated',
      'interviewKitsGenerated',
      'embeddingCalls',
      'llmCalls'
    ];
    
    if (!validCounters.includes(counterName)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid counter name',
        statusCode: 400
      });
    }
    
    await incrementUsage(req.tenantId, counterName, amount);
    const usageData = await getUsageWithLimits(req.tenantId);
    
    res.status(200).json({
      success: true,
      data: usageData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get usage analytics
 * @route   GET /api/usage/analytics
 * @access  Private (Admin only)
 */
export const getUsageAnalytics = async (req, res, next) => {
  try {
    const usageData = await getUsageWithLimits(req.tenantId);
    
    // Calculate additional analytics
    const analytics = {
      ...usageData,
      warnings: [],
      recommendations: []
    };
    
    // Add warnings for high usage
    if (usageData.percentUsed.resumes > 80) {
      analytics.warnings.push({
        type: 'resume',
        message: 'Resume limit almost reached',
        severity: 'warning'
      });
    }
    
    if (usageData.percentUsed.jobs > 80) {
      analytics.warnings.push({
        type: 'job',
        message: 'Job limit almost reached',
        severity: 'warning'
      });
    }
    
    if (usageData.percentUsed.aiUsage > 80) {
      analytics.warnings.push({
        type: 'aiUsage',
        message: 'AI usage limit almost reached',
        severity: 'warning'
      });
    }
    
    // Add upgrade recommendations
    if (usageData.percentUsed.resumes > 70 || usageData.percentUsed.jobs > 70) {
      analytics.recommendations.push({
        action: 'upgrade',
        plan: 'PRO',
        reason: 'Increased limits and premium features'
      });
    }
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};
