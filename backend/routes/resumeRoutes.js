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
  bulkUpdateStatus,
  addNote,
  getNotes
} from '../controllers/resumeController.js';
import { protect } from '../middleware/auth.js';
import { checkResumeLimit } from '../middleware/planLimits.js';
import { uploadSingle, uploadMultiple } from '../middleware/upload.js';
import { validateUploadedFile, validateUploadedFiles } from '../middleware/fileValidation.js';

// Protected routes
router.use(protect); // All routes require authentication

// Stats and search routes (must be before /:id)
router.get('/stats/summary', getResumeStats);
router.get('/search', searchResumes);
router.get('/job/:jobId', getResumesByJob);

// Upload routes with limit check and file validation
router.post('/upload', checkResumeLimit, uploadSingle, validateUploadedFile, uploadResume);
router.post('/upload/bulk', checkResumeLimit, uploadMultiple, validateUploadedFiles, uploadMultipleResumes);

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

// Notes
router.post('/:id/notes', addNote);
router.get('/:id/notes', getNotes);

// Retry parsing
router.post('/:id/retry-parse', retryParsing);

export default router;
