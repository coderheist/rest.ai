import asyncHandler from 'express-async-handler';
import * as reviewService from '../services/reviewService.js';

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(
    req.user.tenantId,
    req.user._id,
    req.body
  );
  res.status(201).json(review);
});

// @desc    Get review by ID
// @route   GET /api/reviews/:id
// @access  Private
export const getReviewById = asyncHandler(async (req, res) => {
  const review = await reviewService.getReviewById(req.params.id, req.user.tenantId);
  res.json(review);
});

// @desc    Get reviews for a match
// @route   GET /api/reviews/match/:matchId
// @access  Private
export const getReviewsByMatch = asyncHandler(async (req, res) => {
  const data = await reviewService.getReviewsByMatch(req.params.matchId, req.user.tenantId);
  res.json(data);
});

// @desc    Get reviews for a job
// @route   GET /api/reviews/job/:jobId
// @access  Private
export const getReviewsByJob = asyncHandler(async (req, res) => {
  const options = {
    minRating: req.query.minRating ? parseInt(req.query.minRating) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit) : 50
  };
  const reviews = await reviewService.getReviewsByJob(req.params.jobId, req.user.tenantId, options);
  res.json(reviews);
});

// @desc    Get reviews by reviewer
// @route   GET /api/reviews/reviewer/:reviewerId
// @access  Private
export const getReviewsByReviewer = asyncHandler(async (req, res) => {
  const options = {
    limit: req.query.limit ? parseInt(req.query.limit) : 50
  };
  const reviews = await reviewService.getReviewsByReviewer(req.params.reviewerId, req.user.tenantId, options);
  res.json(reviews);
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = asyncHandler(async (req, res) => {
  const review = await reviewService.updateReview(
    req.params.id,
    req.user.tenantId,
    req.user._id,
    req.body
  );
  res.json(review);
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(async (req, res) => {
  const result = await reviewService.deleteReview(
    req.params.id,
    req.user.tenantId,
    req.user._id
  );
  res.json(result);
});

// @desc    Get average rating for a match
// @route   GET /api/reviews/match/:matchId/average
// @access  Private
export const getAverageRating = asyncHandler(async (req, res) => {
  const averageRating = await reviewService.getAverageRating(req.params.matchId, req.user.tenantId);
  res.json(averageRating);
});

// @desc    Get recommendation distribution for a job
// @route   GET /api/reviews/job/:jobId/recommendations
// @access  Private
export const getRecommendationDistribution = asyncHandler(async (req, res) => {
  const distribution = await reviewService.getRecommendationDistribution(req.params.jobId, req.user.tenantId);
  res.json(distribution);
});

// @desc    Get review statistics
// @route   GET /api/reviews/stats
// @access  Private
export const getReviewStats = asyncHandler(async (req, res) => {
  const filters = {
    jobId: req.query.jobId,
    startDate: req.query.startDate,
    endDate: req.query.endDate
  };
  const stats = await reviewService.getReviewStats(req.user.tenantId, filters);
  res.json(stats);
});
