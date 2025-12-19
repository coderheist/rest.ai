import express from 'express';
import { getUsage, incrementUsageCounter, getUsageAnalytics } from '../controllers/usageController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get current usage
router.get('/', getUsage);

// Get usage analytics (admin only)
router.get('/analytics', authorize('ADMIN'), getUsageAnalytics);

// Increment usage counter (internal API)
router.post('/increment', incrementUsageCounter);

export default router;
