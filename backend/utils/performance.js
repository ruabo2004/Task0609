// Performance Monitoring Utilities
// Track and optimize application performance

const { logger } = require("./logger");

/**
 * Performance monitor class
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.thresholds = {
      database: 1000, // 1 second
      api: 2000, // 2 seconds
      external: 5000, // 5 seconds
    };
  }

  /**
   * Start timing an operation
   */
  start(operationId) {
    this.metrics.set(operationId, {
      startTime: process.hrtime.bigint(),
      startMemory: process.memoryUsage(),
    });
  }

  /**
   * End timing and log results
   */
  end(operationId, operationType = "operation", metadata = {}) {
    const metric = this.metrics.get(operationId);
    if (!metric) {
      logger.warn("Performance metric not found", { operationId });
      return null;
    }

    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage();

    const duration = Number(endTime - metric.startTime) / 1000000; // Convert to milliseconds
    const memoryDelta = {
      rss: endMemory.rss - metric.startMemory.rss,
      heapUsed: endMemory.heapUsed - metric.startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - metric.startMemory.heapTotal,
    };

    const result = {
      operationId,
      operationType,
      duration,
      memoryDelta,
      metadata,
    };

    // Log performance data
    const threshold = this.thresholds[operationType] || this.thresholds.api;
    if (duration > threshold) {
      logger.warn(`Slow ${operationType} operation`, result);
    } else {
      logger.performance(operationId, duration, metadata);
    }

    // Clean up
    this.metrics.delete(operationId);

    return result;
  }

  /**
   * Measure function execution time
   */
  async measure(fn, operationId, operationType = "operation", metadata = {}) {
    this.start(operationId);
    try {
      const result = await fn();
      this.end(operationId, operationType, metadata);
      return result;
    } catch (error) {
      this.end(operationId, operationType, {
        ...metadata,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Create a middleware for timing HTTP requests
   */
  createRequestMiddleware() {
    return (req, res, next) => {
      const operationId = `${req.method}-${req.originalUrl}-${Date.now()}`;
      this.start(operationId);

      // Override res.end to measure complete request time
      const originalEnd = res.end;
      res.end = (...args) => {
        this.end(operationId, "api", {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          userAgent: req.get("User-Agent"),
          contentLength: res.get("content-length"),
        });
        originalEnd.apply(res, args);
      };

      next();
    };
  }

  /**
   * Database query performance wrapper
   */
  wrapDatabaseQuery(executeQuery) {
    return async (query, params = []) => {
      const operationId = `db-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      this.start(operationId);

      try {
        const result = await executeQuery(query, params);
        this.end(operationId, "database", {
          queryType: query.trim().split(" ")[0].toUpperCase(),
          rowCount: Array.isArray(result) ? result.length : 0,
          paramCount: params.length,
        });
        return result;
      } catch (error) {
        this.end(operationId, "database", {
          queryType: query.trim().split(" ")[0].toUpperCase(),
          error: error.message,
          paramCount: params.length,
        });
        throw error;
      }
    };
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss: Math.round((usage.rss / 1024 / 1024) * 100) / 100, // MB
      heapUsed: Math.round((usage.heapUsed / 1024 / 1024) * 100) / 100, // MB
      heapTotal: Math.round((usage.heapTotal / 1024 / 1024) * 100) / 100, // MB
      external: Math.round((usage.external / 1024 / 1024) * 100) / 100, // MB
    };
  }

  /**
   * Get system performance stats
   */
  getSystemStats() {
    const cpuUsage = process.cpuUsage();
    const memoryUsage = this.getMemoryUsage();

    return {
      uptime: process.uptime(),
      cpuUsage: {
        user: cpuUsage.user / 1000, // Convert to milliseconds
        system: cpuUsage.system / 1000,
      },
      memoryUsage,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    };
  }
}

/**
 * Cache implementation for performance optimization
 */
class SimpleCache {
  constructor(ttl = 300000) {
    // Default 5 minutes TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  /**
   * Set cache value
   */
  set(key, value, customTTL = null) {
    const ttl = customTTL || this.ttl;
    const expiry = Date.now() + ttl;

    this.cache.set(key, {
      value,
      expiry,
    });

    logger.debug("Cache set", { key, ttl });
  }

  /**
   * Get cache value
   */
  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      logger.debug("Cache miss", { key });
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      logger.debug("Cache expired", { key });
      return null;
    }

    logger.debug("Cache hit", { key });
    return item.value;
  }

  /**
   * Delete cache value
   */
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug("Cache deleted", { key });
    }
    return deleted;
  }

  /**
   * Clear all cache
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    logger.info("Cache cleared", { previousSize: size });
  }

  /**
   * Get cache stats
   */
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const [key, item] of this.cache) {
      if (now > item.expiry) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      active,
      expired,
      hitRate: this.hitRate || 0,
    };
  }

  /**
   * Clean expired entries
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.cache) {
      if (now > item.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info("Cache cleanup completed", { cleanedEntries: cleaned });
    }

    return cleaned;
  }

  /**
   * Wrapper for cached function calls
   */
  async cachedCall(key, fn, ttl = null) {
    // Try to get from cache first
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    try {
      const result = await fn();
      this.set(key, result, ttl);
      return result;
    } catch (error) {
      logger.error("Cached function call failed", error, { key });
      throw error;
    }
  }
}

/**
 * Rate limiter for API endpoints
 */
class RateLimiter {
  constructor(windowMs = 900000, maxRequests = 100) {
    // 15 minutes, 100 requests
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.requests = new Map();
  }

  /**
   * Check if request is allowed
   */
  isAllowed(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get or create request history for this identifier
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }

    const requestHistory = this.requests.get(identifier);

    // Remove old requests outside the window
    const validRequests = requestHistory.filter(
      (timestamp) => timestamp > windowStart
    );
    this.requests.set(identifier, validRequests);

    // Check if under limit
    if (validRequests.length >= this.maxRequests) {
      logger.security("Rate limit exceeded", {
        identifier,
        requestCount: validRequests.length,
        maxRequests: this.maxRequests,
      });
      return false;
    }

    // Add current request
    validRequests.push(now);
    return true;
  }

  /**
   * Get remaining requests for identifier
   */
  getRemaining(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const requestHistory = this.requests.get(identifier) || [];
    const validRequests = requestHistory.filter(
      (timestamp) => timestamp > windowStart
    );

    return Math.max(0, this.maxRequests - validRequests.length);
  }

  /**
   * Reset requests for identifier
   */
  reset(identifier) {
    this.requests.delete(identifier);
  }

  /**
   * Cleanup old entries
   */
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    let cleaned = 0;

    for (const [identifier, requestHistory] of this.requests) {
      const validRequests = requestHistory.filter(
        (timestamp) => timestamp > windowStart
      );

      if (validRequests.length === 0) {
        this.requests.delete(identifier);
        cleaned++;
      } else {
        this.requests.set(identifier, validRequests);
      }
    }

    if (cleaned > 0) {
      logger.debug("Rate limiter cleanup completed", {
        cleanedIdentifiers: cleaned,
      });
    }

    return cleaned;
  }
}

// Create singleton instances
const performanceMonitor = new PerformanceMonitor();
const cache = new SimpleCache();
const rateLimiter = new RateLimiter();

// Schedule periodic cleanup
setInterval(() => {
  cache.cleanup();
  rateLimiter.cleanup();
}, 300000); // Every 5 minutes

module.exports = {
  PerformanceMonitor,
  SimpleCache,
  RateLimiter,
  performanceMonitor,
  cache,
  rateLimiter,
};
