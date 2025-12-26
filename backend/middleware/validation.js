import { body, param, query, validationResult } from 'express-validator';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

/**
 * Auth validation rules
 */
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('companyName')
    .trim()
    .notEmpty().withMessage('Company name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Company name must be between 2 and 200 characters'),
  body('subscriptionPlan')
    .optional()
    .isIn(['free', 'pro', 'enterprise']).withMessage('Invalid subscription plan'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Job validation rules
 */
export const validateCreateJob = [
  body('title')
    .trim()
    .notEmpty().withMessage('Job title is required')
    .isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Job description is required')
    .isLength({ min: 10, max: 10000 }).withMessage('Description must be between 10 and 10000 characters'),
  body('skills.required')
    .optional()
    .isArray().withMessage('Required skills must be an array')
    .custom((skills) => !skills || skills.every(skill => typeof skill === 'string' && skill.trim().length > 0))
    .withMessage('All skills must be non-empty strings'),
  body('skills.preferred')
    .optional()
    .isArray().withMessage('Preferred skills must be an array'),
  body('experienceYears.min')
    .optional()
    .isInt({ min: 0, max: 50 }).withMessage('Minimum experience must be between 0 and 50 years'),
  body('experienceYears.max')
    .optional()
    .custom((value, { req }) => {
      if (value === null || value === undefined) return true;
      const intValue = parseInt(value);
      if (isNaN(intValue)) return false;
      if (intValue < 0 || intValue > 50) return false;
      if (req.body.experienceYears?.min && intValue < req.body.experienceYears.min) return false;
      return true;
    })
    .withMessage('Maximum experience must be between min and 50 years'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Department must be less than 100 characters'),
  body('location.type')
    .optional()
    .isIn(['remote', 'onsite', 'hybrid']).withMessage('Invalid location type'),
  body('employmentType')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'internship', 'temporary']).withMessage('Invalid employment type'),
  body('experienceLevel')
    .optional()
    .isIn(['entry', 'mid', 'senior', 'lead', 'executive']).withMessage('Invalid experience level'),
  body('status')
    .optional()
    .isIn(['active', 'closed', 'draft', 'paused', 'archived']).withMessage('Invalid status'),
  handleValidationErrors
];

export const validateUpdateJob = [
  param('id').isMongoId().withMessage('Invalid job ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 10000 }).withMessage('Description must be between 10 and 10000 characters'),
  body('skills.required')
    .optional()
    .isArray().withMessage('Required skills must be an array'),
  body('skills.preferred')
    .optional()
    .isArray().withMessage('Preferred skills must be an array'),
  body('experienceYears.min')
    .optional()
    .isInt({ min: 0, max: 50 }).withMessage('Minimum experience must be between 0 and 50 years'),
  body('experienceYears.max')
    .optional()
    .custom((value, { req }) => {
      if (value === null || value === undefined) return true;
      const intValue = parseInt(value);
      if (isNaN(intValue)) return false;
      if (intValue < 0 || intValue > 50) return false;
      if (req.body.experienceYears?.min && intValue < req.body.experienceYears.min) return false;
      return true;
    })
    .withMessage('Maximum experience must be between min and 50 years'),
  handleValidationErrors
];

/**
 * Resume validation rules
 */
export const validateResumeUpload = [
  body('jobId')
    .optional()
    .isMongoId().withMessage('Invalid job ID'),
  handleValidationErrors
];

/**
 * Match validation rules
 */
export const validateMatchStatus = [
  param('matchId').isMongoId().withMessage('Invalid match ID'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'reviewed', 'shortlisted', 'rejected']).withMessage('Invalid status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters'),
  handleValidationErrors
];

/**
 * Review validation rules
 */
export const validateCreateReview = [
  body('matchId').isMongoId().withMessage('Invalid match ID'),
  body('jobId').isMongoId().withMessage('Invalid job ID'),
  body('resumeId').isMongoId().withMessage('Invalid resume ID'),
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback')
    .trim()
    .notEmpty().withMessage('Feedback is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Feedback must be between 10 and 2000 characters'),
  body('stage')
    .notEmpty().withMessage('Interview stage is required')
    .isIn(['screening', 'phone_screen', 'technical', 'behavioral', 'final', 'offer'])
    .withMessage('Invalid interview stage'),
  body('recommendation')
    .notEmpty().withMessage('Recommendation is required')
    .isIn(['strong_hire', 'hire', 'maybe', 'no_hire', 'strong_no_hire'])
    .withMessage('Invalid recommendation'),
  body('technicalSkills.rating')
    .optional()
    .isInt({ min: 0, max: 5 }).withMessage('Technical skills rating must be between 0 and 5'),
  body('communication.rating')
    .optional()
    .isInt({ min: 0, max: 5 }).withMessage('Communication rating must be between 0 and 5'),
  body('cultureFit.rating')
    .optional()
    .isInt({ min: 0, max: 5 }).withMessage('Culture fit rating must be between 0 and 5'),
  body('problemSolving.rating')
    .optional()
    .isInt({ min: 0, max: 5 }).withMessage('Problem solving rating must be between 0 and 5'),
  handleValidationErrors
];

export const validateUpdateReview = [
  param('id').isMongoId().withMessage('Invalid review ID'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 }).withMessage('Feedback must be between 10 and 2000 characters'),
  handleValidationErrors
];

/**
 * Note validation rules
 */
export const validateCreateNote = [
  body('matchId').isMongoId().withMessage('Invalid match ID'),
  body('content')
    .trim()
    .notEmpty().withMessage('Note content is required')
    .isLength({ min: 1, max: 2000 }).withMessage('Content must be between 1 and 2000 characters'),
  body('isPrivate')
    .optional()
    .isBoolean().withMessage('isPrivate must be a boolean'),
  handleValidationErrors
];

/**
 * Interview kit validation rules
 */
export const validateGenerateKit = [
  body('jobId').isMongoId().withMessage('Invalid job ID'),
  body('resumeId').isMongoId().withMessage('Invalid resume ID'),
  handleValidationErrors
];

/**
 * Query parameter validation
 */
export const validateJobQuery = [
  query('status')
    .optional()
    .isIn(['active', 'closed', 'draft', 'paused', 'archived']).withMessage('Invalid status'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

export const validateMatchQuery = [
  query('minScore')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('Min score must be between 0 and 100'),
  query('status')
    .optional()
    .isIn(['pending', 'reviewed', 'shortlisted', 'rejected']).withMessage('Invalid status'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

/**
 * MongoDB ID validation
 */
export const validateMongoId = (paramName = 'id') => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
  handleValidationErrors
];
