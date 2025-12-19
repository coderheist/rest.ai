import asyncHandler from 'express-async-handler';
import matchService from '../services/matchService.js';

/**
 * @route   POST /api/matches/calculate
 * @desc    Calculate match between job and resume
 * @access  Private
 */
export const calculateMatch = asyncHandler(async (req, res) => {
  const { jobId, resumeId } = req.body;
  const tenantId = req.user.tenantId;

  if (!jobId || !resumeId) {
    res.status(400);
    throw new Error('Job ID and Resume ID are required');
  }

  const match = await matchService.calculateMatch(jobId, resumeId, tenantId);

  res.status(201).json({
    success: true,
    data: match
  });
});

/**
 * @route   POST /api/matches/job/:jobId/calculate-all
 * @desc    Calculate matches for all resumes in a job
 * @access  Private
 */
export const calculateJobMatches = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const tenantId = req.user.tenantId;

  const matches = await matchService.calculateJobMatches(jobId, tenantId);

  res.json({
    success: true,
    count: matches.length,
    data: matches
  });
});

/**
 * @route   GET /api/matches/job/:jobId
 * @desc    Get all matches for a job (ranked candidates)
 * @access  Private
 */
export const getJobMatches = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const tenantId = req.user.tenantId;
  
  const {
    minScore = 0,
    status,
    limit = 100,
    skip = 0
  } = req.query;

  const options = {
    minScore: parseInt(minScore),
    status,
    limit: parseInt(limit),
    skip: parseInt(skip)
  };

  const matches = await matchService.getRankedCandidates(jobId, tenantId, options);

  res.json({
    success: true,
    count: matches.length,
    data: matches
  });
});

/**
 * @route   GET /api/matches/job/:jobId/stats
 * @desc    Get match statistics for a job
 * @access  Private
 */
export const getJobMatchStats = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const tenantId = req.user.tenantId;

  const stats = await matchService.getMatchStats(jobId, tenantId);

  res.json({
    success: true,
    data: stats
  });
});

/**
 * @route   GET /api/matches/resume/:resumeId
 * @desc    Get all matches for a resume
 * @access  Private
 */
export const getResumeMatches = asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const tenantId = req.user.tenantId;
  
  const { minScore = 0, limit = 50 } = req.query;

  const options = {
    minScore: parseInt(minScore),
    limit: parseInt(limit)
  };

  const matches = await matchService.getResumeMatches(resumeId, tenantId, options);

  res.json({
    success: true,
    count: matches.length,
    data: matches
  });
});

/**
 * @route   GET /api/matches/:matchId
 * @desc    Get single match details
 * @access  Private
 */
export const getMatch = asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const tenantId = req.user.tenantId;

  const match = await matchService.getMatch(matchId, tenantId);

  if (!match) {
    res.status(404);
    throw new Error('Match not found');
  }

  res.json({
    success: true,
    data: match
  });
});

/**
 * @route   PATCH /api/matches/:matchId/status
 * @desc    Update match status (review)
 * @access  Private
 */
export const updateMatchStatus = asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const { status, notes } = req.body;
  const tenantId = req.user.tenantId;
  const userId = req.user._id;

  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }

  const match = await matchService.updateMatchStatus(
    matchId,
    status,
    userId,
    notes,
    tenantId
  );

  res.json({
    success: true,
    data: match
  });
});

/**
 * @route   GET /api/matches/top
 * @desc    Get top matches across all jobs
 * @access  Private
 */
export const getTopMatches = asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId;
  const { limit = 20 } = req.query;

  const matches = await matchService.getTopMatches(tenantId, parseInt(limit));

  res.json({
    success: true,
    count: matches.length,
    data: matches
  });
});

/**
 * @route   GET /api/matches/search
 * @desc    Search matches with filters
 * @access  Private
 */
export const searchMatches = asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId;
  const filters = {
    jobId: req.query.jobId,
    minScore: req.query.minScore ? parseInt(req.query.minScore) : undefined,
    maxScore: req.query.maxScore ? parseInt(req.query.maxScore) : undefined,
    recommendation: req.query.recommendation,
    status: req.query.status,
    limit: req.query.limit ? parseInt(req.query.limit) : 100
  };

  const matches = await matchService.searchMatches(tenantId, filters);

  res.json({
    success: true,
    count: matches.length,
    data: matches
  });
});

/**
 * @route   POST /api/matches/job/:jobId/update-rankings
 * @desc    Recalculate rankings for a job
 * @access  Private
 */
export const updateRankings = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const tenantId = req.user.tenantId;

  const count = await matchService.updateRankings(jobId, tenantId);

  res.json({
    success: true,
    message: `Updated rankings for ${count} candidates`
  });
});

/**
 * @route   PATCH /api/matches/:matchId/shortlist
 * @desc    Toggle shortlist status for a match
 * @access  Private
 */
export const toggleShortlist = asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const tenantId = req.user.tenantId;
  const userId = req.user._id;

  const match = await matchService.toggleShortlist(matchId, userId, tenantId);

  res.json({
    success: true,
    data: match,
    message: match.isShortlisted ? 'Candidate shortlisted' : 'Candidate removed from shortlist'
  });
});

/**
 * @route   GET /api/matches/shortlisted
 * @desc    Get all shortlisted candidates
 * @access  Private
 */
export const getShortlistedCandidates = asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId;
  const filters = {
    jobId: req.query.jobId,
    minScore: req.query.minScore ? parseInt(req.query.minScore) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit) : 100
  };

  const matches = await matchService.getShortlistedCandidates(tenantId, filters);

  res.json({
    success: true,
    count: matches.length,
    data: matches
  });
});

/**
 * @route   POST /api/matches/:matchId/assign-interviewer
 * @desc    Assign an interviewer to a match
 * @access  Private
 */
export const assignInterviewer = asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const { userId } = req.body;
  const tenantId = req.user.tenantId;
  const assignedBy = req.user._id;

  const match = await matchService.assignInterviewer(matchId, userId, assignedBy, tenantId);

  res.json({
    success: true,
    data: match,
    message: 'Interviewer assigned successfully'
  });
});

/**
 * @route   DELETE /api/matches/:matchId/assign-interviewer/:userId
 * @desc    Unassign an interviewer from a match
 * @access  Private
 */
export const unassignInterviewer = asyncHandler(async (req, res) => {
  const { matchId, userId } = req.params;
  const tenantId = req.user.tenantId;

  const match = await matchService.unassignInterviewer(matchId, userId, tenantId);

  res.json({
    success: true,
    data: match,
    message: 'Interviewer unassigned successfully'
  });
});
