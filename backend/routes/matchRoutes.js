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
  getShortlistedCandidates,
  assignInterviewer,
  unassignInterviewer
} from '../controllers/matchController.js';
import { protect } from '../middleware/auth.js';
import { validateTenantOwnership } from '../middleware/tenantValidation.js';
import Match from '../models/Match.js';

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
router.get('/:matchId', validateTenantOwnership(Match, 'matchId'), getMatch);

// Update match
router.patch('/:matchId/status', validateTenantOwnership(Match, 'matchId'), updateMatchStatus);
router.patch('/:matchId/shortlist', toggleShortlist);

// Interviewer assignment
router.post('/:matchId/assign-interviewer', assignInterviewer);
router.delete('/:matchId/assign-interviewer/:userId', unassignInterviewer);

export default router;
