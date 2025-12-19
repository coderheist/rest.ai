import express from 'express';
const router = express.Router();
import {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  changeJobStatus,
  getJobStats,
  getActiveJobs,
  duplicateJob,
  bulkUpdateStatus
} from '../controllers/jobController.js';
import { protect } from '../middleware/auth.js';
import { checkJobLimit } from '../middleware/planLimits.js';
import {
  validateCreateJob,
  validateUpdateJob,
  validateJobQuery,
  validateMongoId
} from '../middleware/validation.js';

// Public routes (none for jobs - all require authentication)

// Protected routes
router.use(protect); // All routes below require authentication

// Stats route (must be before /:id to avoid conflict)
router.get('/stats/summary', getJobStats);

// Active jobs route
router.get('/active', getActiveJobs);

// Bulk operations
router.patch('/bulk/status', bulkUpdateStatus);

// Main CRUD routes
router.route('/')
  .get(validateJobQuery, getJobs)
  .post(validateCreateJob, checkJobLimit, createJob); // Check limit before creating

router.route('/:id')
  .get(validateMongoId('id'), getJob)
  .put(validateUpdateJob, updateJob)
  .delete(validateMongoId('id'), deleteJob);

// Status management
router.patch('/:id/status', validateMongoId('id'), changeJobStatus);

// Duplicate job
router.post('/:id/duplicate', validateMongoId('id'), checkJobLimit, duplicateJob);

export default router;
