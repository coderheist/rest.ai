import express from 'express';
const router = express.Router();
import {
  uploadResume,
  uploadMultipleResumes,
  getResumes,
  getResume,
  updateResumeStatus,
  updateResumeMetadata,
  deleteResume,
  retryParsing,
  getResumeStats,
  searchResumes,
  getResumesByJob,
  bulkUpdateStatus
} from '../controllers/resumeController.js';
import { protect } from '../middleware/auth.js';
import { checkResumeLimit } from '../middleware/planLimits.js';
import { uploadSingle, uploadMultiple } from '../middleware/upload.js';

// Protected routes
router.use(protect); // All routes require authentication

// Stats and search routes (must be before /:id)
router.get('/stats/summary', getResumeStats);
router.get('/search', searchResumes);
router.get('/job/:jobId', getResumesByJob);

// Upload routes with limit check
router.post('/upload', checkResumeLimit, uploadSingle, uploadResume);
router.post('/upload/bulk', checkResumeLimit, uploadMultiple, uploadMultipleResumes);

// Bulk operations
router.patch('/bulk/status', bulkUpdateStatus);

// Main CRUD routes
router.route('/')
  .get(getResumes);

router.route('/:id')
  .get(getResume)
  .delete(deleteResume);

// Status and metadata updates
router.patch('/:id/status', updateResumeStatus);
router.patch('/:id/metadata', updateResumeMetadata);

// Retry parsing
router.post('/:id/retry-parse', retryParsing);

export default router;
