// Utils Index
// Export all utility functions for easy importing

const jwt = require("./jwt");
const logger = require("./logger");
const responseHelper = require("./responseHelper");
const validation = require("./validation");
const validationHelpers = require("./validationHelpers");
const errors = require("./errors");
const performance = require("./performance");
const swagger = require("./swagger");

module.exports = {
  // JWT utilities
  ...jwt,

  // Logging utilities
  logger: logger.logger,
  requestLogger: logger.requestLogger,
  errorLogger: logger.errorLogger,
  queryLogger: logger.queryLogger,

  // Response helpers
  ...responseHelper,

  // Validation utilities
  validationRules: validation.validationRules,
  handleValidationErrors: validation.handleValidationErrors,
  validationHelpers: validationHelpers.validationHelpers,
  commonValidations: validationHelpers.commonValidations,
  sanitizers: validationHelpers.sanitizers,

  // Error handling
  ...errors,

  // Performance monitoring
  performanceMonitor: performance.performanceMonitor,
  cache: performance.cache,
  rateLimiter: performance.rateLimiter,
  PerformanceMonitor: performance.PerformanceMonitor,
  SimpleCache: performance.SimpleCache,
  RateLimiter: performance.RateLimiter,

  // API Documentation
  swagger: swagger.specs,
  swaggerUi: swagger.swaggerUi,
  swaggerConfig: swagger.swaggerConfig,
};
