// Enhanced Global Error Handling Middleware
// Comprehensive error handling with logging and monitoring

const { logger } = require("../utils/logger");
const { ErrorHandler, ErrorFormatter } = require("../utils/errors");

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error("Unhandled error caught by error middleware", err, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    userId: req.user?.id,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  let processedError = err;

  // Handle specific error types
  if (
    err.name === "SequelizeValidationError" ||
    err.name === "ValidationError"
  ) {
    processedError = ErrorHandler.handleDatabaseError(err);
  } else if (
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError" ||
    err.name === "NotBeforeError"
  ) {
    processedError = ErrorHandler.handleJWTError(err);
  } else if (
    err.code &&
    (err.code.startsWith("ER_") || err.code.startsWith("LIMIT_"))
  ) {
    if (err.code.startsWith("LIMIT_")) {
      processedError = ErrorHandler.handleMulterError(err);
    } else {
      processedError = ErrorHandler.handleDatabaseError(err);
    }
  } else if (!ErrorHandler.isOperationalError(err)) {
    // Log unexpected errors for investigation
    logger.error("Unexpected error", err, {
      isOperational: false,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // Format error response
  const includeStack = process.env.NODE_ENV === "development";
  const formattedError = ErrorFormatter.format(processedError, includeStack);

  // Set security headers for error responses
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
  });

  // Send error response
  res.status(processedError.statusCode || 500).json(formattedError);
};

module.exports = errorHandler;
