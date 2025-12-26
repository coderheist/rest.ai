import cacheService from '../utils/cache.js';
import logger from '../utils/logger.js';

/**
 * Cache middleware for GET requests
 * Usage: router.get('/endpoint', cacheMiddleware(300), controller)
 */
export const cacheMiddleware = (ttl = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key based on URL and user
    const cacheKey = `http:${req.user?.tenantId || 'public'}:${req.originalUrl}`;

    try {
      // Try to get cached response
      const cachedData = await cacheService.get(cacheKey);

      if (cachedData) {
        logger.debug(`Serving cached response for ${req.originalUrl}`);
        return res.status(200).json(cachedData);
      }

      // Store original res.json
      const originalJson = res.json.bind(res);

      // Override res.json to cache response
      res.json = function (data) {
        // Cache successful responses
        if (res.statusCode === 200 && data) {
          cacheService.set(cacheKey, data, ttl).catch(err => {
            logger.error('Failed to cache response:', err);
          });
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Invalidate cache for specific patterns
 */
export const invalidateCache = (patterns) => {
  return async (req, res, next) => {
    // Store original res.json
    const originalJson = res.json.bind(res);

    // Override res.json to invalidate cache after successful operations
    res.json = async function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const tenantId = req.user?.tenantId;
        
        for (const pattern of patterns) {
          const cachePattern = `http:${tenantId}:*${pattern}*`;
          await cacheService.delPattern(cachePattern);
          logger.debug(`Invalidated cache pattern: ${cachePattern}`);
        }
      }
      return originalJson(data);
    };

    next();
  };
};

/**
 * Cache statistics middleware
 */
export const cacheStats = async (req, res) => {
  const stats = await cacheService.getStats();
  res.status(200).json({
    success: true,
    data: stats
  });
};
