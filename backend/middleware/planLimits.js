import { checkLimit } from '../services/usageService.js';

/**
 * Check Resume Limit Middleware
 * Prevents resume processing if limit exceeded
 */
export const checkResumeLimit = async (req, res, next) => {
  try {
    const exceeded = await checkLimit(req.tenantId, 'resume');
    
    if (exceeded) {
      return res.status(403).json({
        success: false,
        error: 'Resume processing limit reached for your plan. Please upgrade.',
        statusCode: 403,
        limitType: 'resume'
      });
    }
    
    next();
  } catch (error) {
    console.error('Resume limit check error:', error);
    next(error);
  }
};

/**
 * Check Job Limit Middleware
 * Prevents job creation if limit exceeded
 */
export const checkJobLimit = async (req, res, next) => {
  try {
    const exceeded = await checkLimit(req.tenantId, 'jd');
    
    if (exceeded) {
      return res.status(403).json({
        success: false,
        error: 'Job creation limit reached for your plan. Please upgrade.',
        statusCode: 403,
        limitType: 'job'
      });
    }
    
    next();
  } catch (error) {
    console.error('Job limit check error:', error);
    next(error);
  }
};

/**
 * Check AI Usage Limit Middleware
 * Prevents AI operations if limit exceeded
 */
export const checkAILimit = async (req, res, next) => {
  try {
    const exceeded = await checkLimit(req.tenantId, 'aiUsage');
    
    if (exceeded) {
      return res.status(403).json({
        success: false,
        error: 'AI usage limit reached for your plan. Please upgrade.',
        statusCode: 403,
        limitType: 'aiUsage'
      });
    }
    
    next();
  } catch (error) {
    console.error('AI limit check error:', error);
    next(error);
  }
};
