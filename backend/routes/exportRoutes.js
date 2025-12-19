import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  exportCandidatePDF,
  exportCandidatesCSV,
  exportJobSummaryPDF,
  getExportStats
} from '../controllers/exportController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Export statistics
router.get('/stats', getExportStats);

// Candidate exports
router.get('/candidate/:matchId/pdf', exportCandidatePDF);

// Job exports
router.get('/job/:jobId/candidates/csv', exportCandidatesCSV);
router.get('/job/:jobId/summary/pdf', exportJobSummaryPDF);

export default router;
