import resumeService from '../services/resumeService.js';
import asyncHandler from 'express-async-handler';

/**
 * @desc    Upload single resume
 * @route   POST /api/resumes/upload
 * @access  Private
 */
export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a file');
  }

  const jobId = req.body.jobId || null;

  const resume = await resumeService.uploadResume(
    req.file,
    req.user._id,
    req.user.tenantId,
    jobId
  );

  res.status(201).json({
    success: true,
    data: resume,
    message: 'Resume uploaded successfully. Parsing in progress...'
  });
});

/**
 * @desc    Upload multiple resumes
 * @route   POST /api/resumes/upload/bulk
 * @access  Private
 */
export const uploadMultipleResumes = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('Please upload at least one file');
  }

  const jobId = req.body.jobId || null;

  const results = await resumeService.uploadMultipleResumes(
    req.files,
    req.user._id,
    req.user.tenantId,
    jobId
  );

  res.status(201).json({
    success: true,
    data: results,
    message: `${results.successful.length} resumes uploaded successfully${
      results.failed.length > 0 ? `, ${results.failed.length} failed` : ''
    }`
  });
});

/**
 * @desc    Get all resumes
 * @route   GET /api/resumes
 * @access  Private
 */
export const getResumes = asyncHandler(async (req, res) => {
  const filters = {
    jobId: req.query.jobId,
    status: req.query.status,
    parsingStatus: req.query.parsingStatus,
    search: req.query.search,
    limit: parseInt(req.query.limit) || 100
  };

  const resumes = await resumeService.getResumes(req.user.tenantId, filters);

  res.status(200).json({
    success: true,
    count: resumes.length,
    data: resumes
  });
});

/**
 * @desc    Get single resume
 * @route   GET /api/resumes/:id
 * @access  Private
 */
export const getResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.getResumeById(
    req.params.id,
    req.user.tenantId,
    req.user._id
  );

  res.status(200).json({
    success: true,
    data: resume
  });
});

/**
 * @desc    Update resume status
 * @route   PATCH /api/resumes/:id/status
 * @access  Private
 */
export const updateResumeStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }

  const resume = await resumeService.updateResumeStatus(
    req.params.id,
    status,
    req.user.tenantId
  );

  res.status(200).json({
    success: true,
    data: resume,
    message: `Resume status updated to ${status}`
  });
});

/**
 * @desc    Update resume metadata (notes, tags)
 * @route   PATCH /api/resumes/:id/metadata
 * @access  Private
 */
export const updateResumeMetadata = asyncHandler(async (req, res) => {
  const updates = {
    notes: req.body.notes,
    tags: req.body.tags
  };

  const resume = await resumeService.updateResumeMetadata(
    req.params.id,
    req.user.tenantId,
    updates
  );

  res.status(200).json({
    success: true,
    data: resume,
    message: 'Resume metadata updated successfully'
  });
});

/**
 * @desc    Delete resume
 * @route   DELETE /api/resumes/:id
 * @access  Private
 */
export const deleteResume = asyncHandler(async (req, res) => {
  const result = await resumeService.deleteResume(req.params.id, req.user.tenantId);

  res.status(200).json({
    success: true,
    message: result.message
  });
});

/**
 * @desc    Retry parsing for failed resume
 * @route   POST /api/resumes/:id/retry-parse
 * @access  Private
 */
export const retryParsing = asyncHandler(async (req, res) => {
  const resume = await resumeService.retryParsing(req.params.id, req.user.tenantId);

  res.status(200).json({
    success: true,
    data: resume,
    message: 'Resume parsing restarted'
  });
});

/**
 * @desc    Get resume statistics
 * @route   GET /api/resumes/stats/summary
 * @access  Private
 */
export const getResumeStats = asyncHandler(async (req, res) => {
  const jobId = req.query.jobId || null;
  const stats = await resumeService.getResumeStats(req.user.tenantId, jobId);

  res.status(200).json({
    success: true,
    data: stats
  });
});

/**
 * @desc    Search resumes
 * @route   GET /api/resumes/search
 * @access  Private
 */
export const searchResumes = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    res.status(400);
    throw new Error('Search query is required');
  }

  const resumes = await resumeService.searchResumes(req.user.tenantId, q);

  res.status(200).json({
    success: true,
    count: resumes.length,
    data: resumes
  });
});

/**
 * @desc    Get resumes by job
 * @route   GET /api/resumes/job/:jobId
 * @access  Private
 */
export const getResumesByJob = asyncHandler(async (req, res) => {
  const resumes = await resumeService.getResumesByJob(
    req.params.jobId,
    req.user.tenantId
  );

  res.status(200).json({
    success: true,
    count: resumes.length,
    data: resumes
  });
});

/**
 * @desc    Bulk update resume status
 * @route   PATCH /api/resumes/bulk/status
 * @access  Private
 */
export const bulkUpdateStatus = asyncHandler(async (req, res) => {
  const { resumeIds, status } = req.body;

  if (!resumeIds || !Array.isArray(resumeIds) || resumeIds.length === 0) {
    res.status(400);
    throw new Error('resumeIds array is required');
  }

  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }

  const result = await resumeService.bulkUpdateStatus(
    resumeIds,
    status,
    req.user.tenantId
  );

  res.status(200).json({
    success: true,
    data: result,
    message: result.message
  });
});

/**
 * @desc    Add note to resume
 * @route   POST /api/resumes/:id/notes
 * @access  Private
 */
export const addNote = asyncHandler(async (req, res) => {
  const { note } = req.body;

  if (!note || !note.trim()) {
    res.status(400);
    throw new Error('Note text is required');
  }

  const resume = await resumeService.addNote(
    req.params.id,
    note,
    req.user._id,
    req.user.tenantId
  );

  res.status(200).json({
    success: true,
    data: resume,
    message: 'Note added successfully'
  });
});

/**
 * @desc    Get notes for resume
 * @route   GET /api/resumes/:id/notes
 * @access  Private
 */
export const getNotes = asyncHandler(async (req, res) => {
  const notes = await resumeService.getNotes(
    req.params.id,
    req.user.tenantId
  );

  res.status(200).json({
    success: true,
    data: notes
  });
});
