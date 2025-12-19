import express from 'express';
import { protect } from '../middleware/auth.js';
import * as dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/pipeline', dashboardController.getCandidatePipeline);
router.get('/activities', dashboardController.getRecentActivities);
router.get('/analytics', dashboardController.getJobAnalytics);
router.get('/top-jobs', dashboardController.getTopPerformingJobs);
router.get('/usage', dashboardController.getUsageAnalytics);

export default router;
