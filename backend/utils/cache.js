import { createClient } from 'redis';
import NodeCache from 'node-cache';
import logger from './logger.js';

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.DEFAULT_TTL = 3600; // 1 hour in seconds
    
    // In-memory cache as fallback
    this.memoryCache = new NodeCache({
      stdTTL: this.DEFAULT_TTL,
      checkperiod: 120,
      useClones: false
    });
    
    // Cache statistics
    this.stats = {
      hits: 0,
      misses: 0,
      redisHits: 0,
      memoryHits: 0
    };
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    try {
      // Only connect if Redis URL is provided
      if (!process.env.REDIS_URL) {
        logger.warn('Redis URL not configured. Using memory cache only.');
        return;
      }

      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis max reconnection attempts reached');
              return new Error('Redis max reconnection attempts reached');
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis client connecting...');
      });

      this.client.on('ready', () => {
        logger.info('Redis client ready');
        this.isConnected = true;
      });

      this.client.on('end', () => {
        logger.info('Redis client disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      this.isConnected = false;
    }
  }

  /**
   * Get cached data (tries Redis first, then memory cache)
   */
  async get(key) {
    // Try Redis first if connected
    if (this.isConnected && this.client) {
      try {
        const data = await this.client.get(key);
        if (data) {
          this.stats.hits++;
          this.stats.redisHits++;
          logger.debug(`Cache HIT (Redis): ${key}`);
          return JSON.parse(data);
        }
      } catch (error) {
        logger.error(`Redis GET error for key ${key}:`, error);
      }
    }

    // Fallback to memory cache
    const memData = this.memoryCache.get(key);
    if (memData !== undefined) {
      this.stats.hits++;
      this.stats.memoryHits++;
      logger.debug(`Cache HIT (Memory): ${key}`);
      return memData;
    }

    // Cache miss
    this.stats.misses++;
    logger.debug(`Cache MISS: ${key}`);
    return null;
  }

  /**
   * Set a value in cache (sets in both Redis and memory cache)
   */
  async set(key, value, ttl = this.DEFAULT_TTL) {
    let success = false;

    // Try Redis first
    if (this.isConnected && this.client) {
      try {
        await this.client.setEx(key, ttl, JSON.stringify(value));
        logger.debug(`Cache SET (Redis): ${key} (TTL: ${ttl}s)`);
        success = true;
      } catch (error) {
        logger.error(`Redis SET error for key ${key}:`, error);
      }
    }

    // Always set in memory cache as fallback
    this.memoryCache.set(key, value, ttl);
    logger.debug(`Cache SET (Memory): ${key} (TTL: ${ttl}s)`);
    
    return success || true; // Return true if either succeeded
  }

  /**
   * Delete a key from cache (from both Redis and memory)
   */
  async del(key) {
    let success = false;

    // Delete from Redis
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
        logger.debug(`Cache DEL (Redis): ${key}`);
        success = true;
      } catch (error) {
        logger.error(`Redis DEL error for key ${key}:`, error);
      }
    }

    // Delete from memory cache
    this.memoryCache.del(key);
    logger.debug(`Cache DEL (Memory): ${key}`);
    
    return success || true;
  }

  /**
   * Delete keys matching a pattern
   */
  async delPattern(pattern) {
    let success = false;

    // Delete from Redis
    if (this.isConnected && this.client) {
      try {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(keys);
          logger.debug(`Cache DEL pattern (Redis): ${pattern} (${keys.length} keys)`);
        }
        success = true;
      } catch (error) {
        logger.error(`Redis DEL pattern error for ${pattern}:`, error);
      }
    }

    // Delete from memory cache
    const memKeys = this.memoryCache.keys();
    const matchedKeys = memKeys.filter(key => key.includes(pattern));
    if (matchedKeys.length > 0) {
      this.memoryCache.del(matchedKeys);
      logger.debug(`Cache DEL pattern (Memory): ${pattern} (${matchedKeys.length} keys)`);
    }

    return success || true;
  }

  /**
   * Clear all cache
   */
  async flushAll() {
    let success = false;

    // Flush Redis
    if (this.isConnected && this.client) {
      try {
        await this.client.flushAll();
        logger.info('Cache flushed (Redis)');
        success = true;
      } catch (error) {
        logger.error('Redis flush error:', error);
      }
    }

    // Flush memory cache
    this.memoryCache.flushAll();
    logger.info('Cache flushed (Memory)');
    
    return success || true;
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    // Check Redis first
    if (this.isConnected && this.client) {
      try {
        const exists = await this.client.exists(key);
        if (exists) {
          return true;
        }
      } catch (error) {
        logger.error(`Redis EXISTS error for key ${key}:`, error);
      }
    }

    // Check memory cache
    return this.memoryCache.has(key);
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    const memStats = this.memoryCache.getStats();
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) : 0;

    const stats = {
      redis: {
        connected: this.isConnected,
        hits: this.stats.redisHits
      },
      memory: {
        hits: this.stats.memoryHits,
        keys: this.memoryCache.keys().length,
        stats: memStats
      },
      overall: {
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: `${hitRate}%`
      }
    };

    // Get Redis stats if connected
    if (this.isConnected && this.client) {
      try {
        const info = await this.client.info('stats');
        stats.redis.info = info;
      } catch (error) {
        logger.error('Cache stats error:', error);
      }
    }

    return stats;
  }

  /**
   * Generate cache key for tenant-specific data
   */
  generateKey(tenantId, resource, id = '') {
    return `tenant:${tenantId}:${resource}${id ? `:${id}` : ''}`;
  }

  /**
   * Disconnect from Redis
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      logger.info('Redis client disconnected');
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

export default cacheService;
