import express from 'express';
import { protect } from '../middleware/auth.js';
import * as reviewController from '../controllers/reviewController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Stats and aggregations
router.get('/stats', reviewController.getReviewStats);
router.get('/job/:jobId/recommendations', reviewController.getRecommendationDistribution);
router.get('/match/:matchId/average', reviewController.getAverageRating);

// Get reviews by entity
router.get('/match/:matchId', reviewController.getReviewsByMatch);
router.get('/job/:jobId', reviewController.getReviewsByJob);
router.get('/reviewer/:reviewerId', reviewController.getReviewsByReviewer);

// CRUD operations
router.post('/', reviewController.createReview);
router.get('/:id', reviewController.getReviewById);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

export default router;
