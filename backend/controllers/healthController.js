import os from 'os';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import logger from '../utils/logger.js';

/**
 * @desc    Health check endpoint
 * @route   GET /api/health
 * @access  Public
 */
export const healthCheck = asyncHandler(async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  };

  // Check database connection
  try {
    if (mongoose.connection.readyState === 1) {
      health.database = 'connected';
    } else {
      health.database = 'disconnected';
      health.status = 'unhealthy';
    }
  } catch (err) {
    health.database = 'error';
    health.status = 'unhealthy';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

/**
 * @desc    Get system statistics
 * @route   GET /api/health/stats
 * @access  Private (Admin only recommended)
 */
export const getSystemStats = asyncHandler(async (req, res) => {
  const stats = {
    timestamp: new Date().toISOString(),
    system: {
      platform: os.platform(),
      arch: os.arch(),
      cpuCount: os.cpus().length,
      totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
      freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
      memoryUsage: `${(((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(2)}%`,
      uptime: `${(os.uptime() / 60 / 60).toFixed(2)} hours`
    },
    process: {
      pid: process.pid,
      uptime: `${(process.uptime() / 60).toFixed(2)} minutes`,
      memoryUsage: {
        rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
        external: `${(process.memoryUsage().external / 1024 / 1024).toFixed(2)} MB`
      },
      nodeVersion: process.version
    },
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      collections: Object.keys(mongoose.connection.collections).length
    }
  };

  // CPU load average (Unix-like systems)
  if (os.loadavg) {
    const loadAvg = os.loadavg();
    stats.system.loadAverage = {
      '1min': loadAvg[0].toFixed(2),
      '5min': loadAvg[1].toFixed(2),
      '15min': loadAvg[2].toFixed(2)
    };
  }

  logger.info('System stats requested', { userId: req.user?._id });

  res.status(200).json({
    success: true,
    data: stats
  });
});

/**
 * @desc    Get application metrics
 * @route   GET /api/health/metrics
 * @access  Private (Admin only recommended)
 */
export const getMetrics = asyncHandler(async (req, res) => {
  // Get collection counts
  const collections = mongoose.connection.collections;
  const collectionStats = {};

  for (const [name, collection] of Object.entries(collections)) {
    try {
      collectionStats[name] = await collection.countDocuments();
    } catch (err) {
      collectionStats[name] = 'error';
    }
  }

  const metrics = {
    timestamp: new Date().toISOString(),
    collections: collectionStats,
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      name: mongoose.connection.name
    }
  };

  res.status(200).json({
    success: true,
    data: metrics
  });
});

/**
 * @desc    Get API info and available endpoints
 * @route   GET /api/health/info
 * @access  Public
 */
export const getApiInfo = asyncHandler(async (req, res) => {
  const info = {
    name: 'AI Resume Screener API',
    version: '1.0.0',
    description: 'Multi-tenant SaaS platform for AI-powered resume screening and candidate matching',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      jobs: '/api/jobs',
      resumes: '/api/resumes',
      matches: '/api/matches',
      interviews: '/api/interviews',
      reviews: '/api/reviews',
      notes: '/api/notes',
      dashboard: '/api/dashboard',
      export: '/api/export',
      usage: '/api/usage',
      health: '/api/health'
    },
    documentation: '/api/docs',
    support: 'support@airesumescreener.com'
  };

  res.status(200).json({
    success: true,
    data: info
  });
});
