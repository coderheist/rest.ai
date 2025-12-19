import asyncHandler from 'express-async-handler';
import * as dashboardService from '../services/dashboardService.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats(req.user.tenantId);
  res.json(stats);
});

// @desc    Get candidate pipeline
// @route   GET /api/dashboard/pipeline
// @access  Private
export const getCandidatePipeline = asyncHandler(async (req, res) => {
  const pipeline = await dashboardService.getCandidatePipeline(req.user.tenantId);
  res.json(pipeline);
});

// @desc    Get recent activities
// @route   GET /api/dashboard/activities
// @access  Private
export const getRecentActivities = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const activities = await dashboardService.getRecentActivities(req.user.tenantId, limit);
  res.json(activities);
});

// @desc    Get job analytics
// @route   GET /api/dashboard/analytics
// @access  Private
export const getJobAnalytics = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const analytics = await dashboardService.getJobAnalytics(req.user.tenantId, days);
  res.json(analytics);
});

// @desc    Get top performing jobs
// @route   GET /api/dashboard/top-jobs
// @access  Private
export const getTopPerformingJobs = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const topJobs = await dashboardService.getTopPerformingJobs(req.user.tenantId, limit);
  res.json(topJobs);
});

// @desc    Get usage analytics
// @route   GET /api/dashboard/usage
// @access  Private
export const getUsageAnalytics = asyncHandler(async (req, res) => {
  const usage = await dashboardService.getUsageAnalytics(req.user.tenantId);
  res.json(usage);
});
