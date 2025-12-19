import jobService from '../services/jobService.js';
import asyncHandler from 'express-async-handler';

/**
 * @desc    Create a new job
 * @route   POST /api/jobs
 * @access  Private
 */
const createJob = asyncHandler(async (req, res) => {
  const job = await jobService.createJob(
    req.body,
    req.user._id,
    req.user.tenantId
  );

  res.status(201).json({
    success: true,
    data: job,
    message: 'Job created successfully'
  });
});

/**
 * @desc    Get all jobs for tenant
 * @route   GET /api/jobs
 * @access  Private
 */
const getJobs = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    employmentType: req.query.employmentType,
    experienceLevel: req.query.experienceLevel,
    location: req.query.location,
    search: req.query.search,
    limit: parseInt(req.query.limit) || 50
  };

  const jobs = await jobService.getJobs(req.user.tenantId, filters);

  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs
  });
});

/**
 * @desc    Get single job by ID
 * @route   GET /api/jobs/:id
 * @access  Private
 */
const getJob = asyncHandler(async (req, res) => {
  const job = await jobService.getJobById(req.params.id, req.user.tenantId);

  res.status(200).json({
    success: true,
    data: job
  });
});

/**
 * @desc    Update a job
 * @route   PUT /api/jobs/:id
 * @access  Private
 */
const updateJob = asyncHandler(async (req, res) => {
  const job = await jobService.updateJob(
    req.params.id,
    req.body,
    req.user.tenantId
  );

  res.status(200).json({
    success: true,
    data: job,
    message: 'Job updated successfully'
  });
});

/**
 * @desc    Delete a job
 * @route   DELETE /api/jobs/:id
 * @access  Private
 */
const deleteJob = asyncHandler(async (req, res) => {
  const result = await jobService.deleteJob(req.params.id, req.user.tenantId);

  res.status(200).json({
    success: true,
    message: result.message
  });
});

/**
 * @desc    Change job status
 * @route   PATCH /api/jobs/:id/status
 * @access  Private
 */
const changeJobStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }

  const job = await jobService.changeJobStatus(
    req.params.id,
    status,
    req.user.tenantId
  );

  res.status(200).json({
    success: true,
    data: job,
    message: `Job status changed to ${status}`
  });
});

/**
 * @desc    Get job statistics
 * @route   GET /api/jobs/stats/summary
 * @access  Private
 */
const getJobStats = asyncHandler(async (req, res) => {
  const stats = await jobService.getJobStats(req.user.tenantId);

  res.status(200).json({
    success: true,
    data: stats
  });
});

/**
 * @desc    Get active jobs only
 * @route   GET /api/jobs/active
 * @access  Private
 */
const getActiveJobs = asyncHandler(async (req, res) => {
  const jobs = await jobService.getActiveJobs(req.user.tenantId);

  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs
  });
});

/**
 * @desc    Duplicate a job
 * @route   POST /api/jobs/:id/duplicate
 * @access  Private
 */
const duplicateJob = asyncHandler(async (req, res) => {
  const job = await jobService.duplicateJob(
    req.params.id,
    req.user.tenantId,
    req.user._id
  );

  res.status(201).json({
    success: true,
    data: job,
    message: 'Job duplicated successfully'
  });
});

/**
 * @desc    Bulk update job status
 * @route   PATCH /api/jobs/bulk/status
 * @access  Private
 */
const bulkUpdateStatus = asyncHandler(async (req, res) => {
  const { jobIds, status } = req.body;

  if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
    res.status(400);
    throw new Error('jobIds array is required');
  }

  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }

  const result = await jobService.bulkUpdateStatus(
    jobIds,
    status,
    req.user.tenantId
  );

  res.status(200).json({
    success: true,
    data: result,
    message: result.message
  });
});

export {
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
};
