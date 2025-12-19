import express from 'express';
import {
  calculateMatch,
  calculateJobMatches,
  getJobMatches,
  getJobMatchStats,
  getResumeMatches,
  getMatch,
  updateMatchStatus,
  getTopMatches,
  searchMatches,
  updateRankings,
  toggleShortlist,
  getShortlistedCandidates
} from '../controllers/matchController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Calculate matches
router.post('/calculate', calculateMatch);
router.post('/job/:jobId/calculate-all', calculateJobMatches);
router.post('/job/:jobId/update-rankings', updateRankings);

// Get matches
router.get('/top', getTopMatches);
router.get('/search', searchMatches);
router.get('/shortlisted', getShortlistedCandidates);
router.get('/job/:jobId', getJobMatches);
router.get('/job/:jobId/stats', getJobMatchStats);
router.get('/resume/:resumeId', getResumeMatches);
router.get('/:matchId', getMatch);

// Update match
router.patch('/:matchId/status', updateMatchStatus);
router.patch('/:matchId/shortlist', toggleShortlist);

export default router;
