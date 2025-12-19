import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  healthCheck,
  getSystemStats,
  getMetrics,
  getApiInfo
} from '../controllers/healthController.js';

const router = express.Router();

// Public health check
router.get('/', healthCheck);

// Public API info
router.get('/info', getApiInfo);

// Protected monitoring endpoints (should add admin check in production)
router.get('/stats', protect, getSystemStats);
router.get('/metrics', protect, getMetrics);

export default router;
