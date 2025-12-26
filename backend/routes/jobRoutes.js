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
  bulkUpdateStatus,
  rankCandidates,
  getTopCandidates,
  rescreenCandidates,
  getJobInsights,
  generateJobPosts
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
  .put(validateMongoId('id'), validateUpdateJob, updateJob)
  .delete(validateMongoId('id'), deleteJob);

// Status management
router.patch('/:id/status', validateMongoId('id'), changeJobStatus);

// Duplicate job
router.post('/:id/duplicate', validateMongoId('id'), checkJobLimit, duplicateJob);

// AI-powered features
router.post('/:id/rank-candidates', validateMongoId('id'), rankCandidates);
router.get('/:id/top-candidates', validateMongoId('id'), getTopCandidates);
router.post('/:id/rescreen', validateMongoId('id'), rescreenCandidates);
router.get('/:id/insights', validateMongoId('id'), getJobInsights);
router.post('/:id/generate-posts', validateMongoId('id'), generateJobPosts);

export default router;
