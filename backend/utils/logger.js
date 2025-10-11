// Logger Utility
// Comprehensive logging system for the application

const fs = require("fs");
const path = require("path");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Log levels
 */
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

/**
 * Color codes for console output
 */
const COLORS = {
  ERROR: "\x1b[31m", // Red
  WARN: "\x1b[33m", // Yellow
  INFO: "\x1b[36m", // Cyan
  DEBUG: "\x1b[35m", // Magenta
  RESET: "\x1b[0m", // Reset
};

/**
 * Logger class
 */
class Logger {
  constructor() {
    this.currentLevel = process.env.LOG_LEVEL
      ? LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()]
      : LOG_LEVELS.INFO;

    this.enableConsole = process.env.NODE_ENV !== "production";
    this.enableFile = true;
  }

  /**
   * Format log message
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta,
    };

    return {
      json: JSON.stringify(logEntry),
      text: `[${timestamp}] [${level}] ${message}${
        Object.keys(meta).length ? " " + JSON.stringify(meta) : ""
      }`,
    };
  }

  /**
   * Write to file
   */
  writeToFile(level, formattedMessage) {
    if (!this.enableFile) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const fileName = `${level.toLowerCase()}-${today}.log`;
      const filePath = path.join(logsDir, fileName);

      fs.appendFileSync(filePath, formattedMessage.text + "\n");

      // Also write to combined log
      const combinedFile = path.join(logsDir, `combined-${today}.log`);
      fs.appendFileSync(combinedFile, formattedMessage.text + "\n");
    } catch (error) {
      console.error("Failed to write log to file:", error);
    }
  }

  /**
   * Write to console
   */
  writeToConsole(level, formattedMessage) {
    if (!this.enableConsole) return;

    const color = COLORS[level] || COLORS.RESET;
  }

  /**
   * Core logging method
   */
  log(level, message, meta = {}) {
    const levelValue = LOG_LEVELS[level];

    if (levelValue > this.currentLevel) {
      return; // Skip if log level is too low
    }

    const formatted = this.formatMessage(level, message, meta);

    this.writeToConsole(level, formatted);
    this.writeToFile(level, formatted);
  }

  /**
   * Error logging
   */
  error(message, error = null, meta = {}) {
    const errorMeta = {
      ...meta,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    };

    this.log("ERROR", message, errorMeta);
  }

  /**
   * Warning logging
   */
  warn(message, meta = {}) {
    this.log("WARN", message, meta);
  }

  /**
   * Info logging
   */
  info(message, meta = {}) {
    this.log("INFO", message, meta);
  }

  /**
   * Debug logging
   */
  debug(message, meta = {}) {
    this.log("DEBUG", message, meta);
  }

  /**
   * HTTP request logging
   */
  request(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get("User-Agent"),
      ip: req.ip || req.connection.remoteAddress,
      statusCode: res.statusCode,
      responseTime: responseTime,
      contentLength: res.get("content-length"),
      ...(req.user && { userId: req.user.id }),
      ...(req.body &&
        Object.keys(req.body).length && {
          bodyKeys: Object.keys(req.body),
        }),
    };

    const level = res.statusCode >= 400 ? "WARN" : "INFO";
    this.log(level, `HTTP ${req.method} ${req.originalUrl}`, logData);
  }

  /**
   * Database operation logging
   */
  database(operation, table, meta = {}) {
    this.debug(`Database ${operation} on ${table}`, meta);
  }

  /**
   * Authentication logging
   */
  auth(action, userId, meta = {}) {
    this.info(`Auth ${action}`, { userId, ...meta });
  }

  /**
   * Security event logging
   */
  security(event, details = {}) {
    this.warn(`Security event: ${event}`, details);
  }

  /**
   * Performance logging
   */
  performance(operation, duration, meta = {}) {
    const level = duration > 1000 ? "WARN" : "INFO";
    this.log(level, `Performance: ${operation} took ${duration}ms`, meta);
  }

  /**
   * Business logic logging
   */
  business(action, details = {}) {
    this.info(`Business: ${action}`, details);
  }
}

/**
 * Request logging middleware
 */
const requestLogger = (logger) => {
  return (req, res, next) => {
    const start = Date.now();

    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = function (...args) {
      const responseTime = Date.now() - start;
      logger.request(req, res, responseTime);
      originalEnd.apply(this, args);
    };

    next();
  };
};

/**
 * Error logging middleware
 */
const errorLogger = (logger) => {
  return (error, req, res, next) => {
    logger.error(`Unhandled error in ${req.method} ${req.originalUrl}`, error, {
      userId: req.user?.id,
      body: req.body,
      params: req.params,
      query: req.query,
    });

    next(error);
  };
};

/**
 * Database query logger
 */
const queryLogger = (logger) => {
  return {
    logQuery: (query, params, duration) => {
      logger.database("QUERY", "unknown", {
        query: query.substring(0, 200), // Truncate long queries
        params: params?.slice(0, 5), // Limit params
        duration,
      });
    },

    logError: (query, params, error) => {
      logger.error("Database query failed", error, {
        query: query.substring(0, 200),
        params: params?.slice(0, 5),
      });
    },
  };
};

// Create singleton logger instance
const logger = new Logger();

// Export structured logging functions
module.exports = {
  logger,
  requestLogger,
  errorLogger,
  queryLogger,

  // Direct access to logging methods
  error: (message, error, meta) => logger.error(message, error, meta),
  warn: (message, meta) => logger.warn(message, meta),
  info: (message, meta) => logger.info(message, meta),
  debug: (message, meta) => logger.debug(message, meta),

  // Specialized logging
  auth: (action, userId, meta) => logger.auth(action, userId, meta),
  security: (event, details) => logger.security(event, details),
  performance: (operation, duration, meta) =>
    logger.performance(operation, duration, meta),
  business: (action, details) => logger.business(action, details),

  // Log levels
  LOG_LEVELS,
};
