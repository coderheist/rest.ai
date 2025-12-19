import express from 'express';
import {
  generateInterviewKit,
  getInterviewKit,
  getJobInterviewKits,
  getResumeInterviewKits,
  getInterviewStats,
  deleteInterviewKit
} from '../controllers/interviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Generate interview kit
router.post('/generate', generateInterviewKit);

// Get statistics
router.get('/stats', getInterviewStats);

// Get interview kits
router.get('/job/:jobId', getJobInterviewKits);
router.get('/resume/:resumeId', getResumeInterviewKits);
router.get('/:id', getInterviewKit);

// Delete interview kit
router.delete('/:id', deleteInterviewKit);

export default router;
