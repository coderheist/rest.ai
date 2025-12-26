import asyncHandler from 'express-async-handler';
import interviewService from '../services/interviewService.js';

/**
 * @route   POST /api/interviews/generate
 * @desc    Generate interview kit for a candidate
 * @access  Private
 */
export const generateInterviewKit = asyncHandler(async (req, res) => {
  const { jobId, resumeId } = req.body;
  const tenantId = req.user.tenantId;
  const userId = req.user._id;

  if (!jobId || !resumeId) {
    res.status(400);
    throw new Error('Job ID and Resume ID are required');
  }

  const kit = await interviewService.generateInterviewKit(jobId, resumeId, tenantId, userId);

  res.status(201).json({
    success: true,
    data: kit
  });
});

/**
 * @route   GET /api/interviews/:id
 * @desc    Get interview kit by ID
 * @access  Private
 */
export const getInterviewKit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.tenantId;

  const kit = await interviewService.getInterviewKit(id, tenantId);

  if (!kit) {
    res.status(404);
    throw new Error('Interview kit not found');
  }

  res.json({
    success: true,
    data: kit
  });
});

/**
 * @route   GET /api/interviews
 * @desc    Get all interview kits
 * @access  Private
 */
export const getAllInterviewKits = asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId;

  const kits = await interviewService.getAllKits(tenantId);

  res.json({
    success: true,
    count: kits.length,
    data: kits
  });
});

/**
 * @route   GET /api/interviews/job/:jobId
 * @desc    Get all interview kits for a job
 * @access  Private
 */
export const getJobInterviewKits = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const tenantId = req.user.tenantId;

  const kits = await interviewService.getKitsByJob(jobId, tenantId);

  res.json({
    success: true,
    count: kits.length,
    data: kits
  });
});

/**
 * @route   GET /api/interviews/resume/:resumeId
 * @desc    Get all interview kits for a resume
 * @access  Private
 */
export const getResumeInterviewKits = asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  const tenantId = req.user.tenantId;

  const kits = await interviewService.getKitsByResume(resumeId, tenantId);

  res.json({
    success: true,
    count: kits.length,
    data: kits
  });
});

/**
 * @route   GET /api/interviews/stats
 * @desc    Get interview kit statistics
 * @access  Private
 */
export const getInterviewStats = asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId;

  const stats = await interviewService.getStats(tenantId);

  res.json({
    success: true,
    data: stats
  });
});

/**
 * @route   DELETE /api/interviews/:id
 * @desc    Delete interview kit
 * @access  Private
 */
export const deleteInterviewKit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.tenantId;

  await interviewService.deleteKit(id, tenantId);

  res.json({
    success: true,
    message: 'Interview kit deleted successfully'
  });
});
