// Custom Error Classes
// Enhanced error handling with specific error types

/**
 * Base application error class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error class
 */
class ValidationError extends AppError {
  constructor(message, field = null, value = null) {
    super(message, 400);
    this.name = "ValidationError";
    this.field = field;
    this.value = value;
  }
}

/**
 * Authentication error class
 */
class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

/**
 * Authorization error class
 */
class AuthorizationError extends AppError {
  constructor(message = "Access denied") {
    super(message, 403);
    this.name = "AuthorizationError";
  }
}

/**
 * Not found error class
 */
class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404);
    this.name = "NotFoundError";
    this.resource = resource;
  }
}

/**
 * Conflict error class (duplicate records, etc.)
 */
class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

/**
 * Rate limit error class
 */
class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super(message, 429);
    this.name = "RateLimitError";
  }
}

/**
 * Database error class
 */
class DatabaseError extends AppError {
  constructor(message, originalError = null) {
    super(message, 500);
    this.name = "DatabaseError";
    this.originalError = originalError;
  }
}

/**
 * External service error class
 */
class ExternalServiceError extends AppError {
  constructor(service, message = "External service error") {
    super(`${service}: ${message}`, 502);
    this.name = "ExternalServiceError";
    this.service = service;
  }
}

/**
 * File upload error class
 */
class FileUploadError extends AppError {
  constructor(message = "File upload failed") {
    super(message, 400);
    this.name = "FileUploadError";
  }
}

/**
 * Business logic error class
 */
class BusinessLogicError extends AppError {
  constructor(message, code = null) {
    super(message, 422);
    this.name = "BusinessLogicError";
    this.code = code;
  }
}

/**
 * Error factory for creating specific errors
 */
class ErrorFactory {
  static validation(message, field = null, value = null) {
    return new ValidationError(message, field, value);
  }

  static authentication(message) {
    return new AuthenticationError(message);
  }

  static authorization(message) {
    return new AuthorizationError(message);
  }

  static notFound(resource) {
    return new NotFoundError(resource);
  }

  static conflict(message) {
    return new ConflictError(message);
  }

  static rateLimit(message) {
    return new RateLimitError(message);
  }

  static database(message, originalError) {
    return new DatabaseError(message, originalError);
  }

  static externalService(service, message) {
    return new ExternalServiceError(service, message);
  }

  static fileUpload(message) {
    return new FileUploadError(message);
  }

  static businessLogic(message, code) {
    return new BusinessLogicError(message, code);
  }

  static generic(message, statusCode) {
    return new AppError(message, statusCode);
  }
}

/**
 * Error formatter for API responses
 */
class ErrorFormatter {
  static format(error, includeStack = false) {
    const formatted = {
      success: false,
      error: {
        name: error.name || "Error",
        message: error.message,
        statusCode: error.statusCode || 500,
        timestamp: error.timestamp || new Date().toISOString(),
      },
    };

    // Add specific error properties
    if (error.field) formatted.error.field = error.field;
    if (error.value) formatted.error.value = error.value;
    if (error.resource) formatted.error.resource = error.resource;
    if (error.service) formatted.error.service = error.service;
    if (error.code) formatted.error.code = error.code;

    // Add stack trace in development
    if (includeStack && error.stack) {
      formatted.error.stack = error.stack;
    }

    return formatted;
  }

  static formatValidationErrors(errors) {
    return {
      success: false,
      error: {
        name: "ValidationError",
        message: "Validation failed",
        statusCode: 400,
        timestamp: new Date().toISOString(),
        details: errors.map((err) => ({
          field: err.path || err.param,
          message: err.msg || err.message,
          value: err.value,
        })),
      },
    };
  }
}

/**
 * Error handler utilities
 */
class ErrorHandler {
  static handleDatabaseError(error) {
    // Handle common database errors
    if (error.code === "ER_DUP_ENTRY") {
      const field = error.sqlMessage.match(/for key '(.+?)'/)?.[1] || "field";
      return ErrorFactory.conflict(`Duplicate ${field} already exists`);
    }

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return ErrorFactory.validation("Referenced record does not exist");
    }

    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return ErrorFactory.conflict(
        "Cannot delete record that is referenced by other records"
      );
    }

    if (error.code === "ER_DATA_TOO_LONG") {
      return ErrorFactory.validation("Data too long for column");
    }

    if (error.code === "ER_BAD_NULL_ERROR") {
      return ErrorFactory.validation("Required field cannot be null");
    }

    return ErrorFactory.database("Database operation failed", error);
  }

  static handleJWTError(error) {
    if (error.name === "TokenExpiredError") {
      return ErrorFactory.authentication("Token has expired");
    }

    if (error.name === "JsonWebTokenError") {
      return ErrorFactory.authentication("Invalid token");
    }

    if (error.name === "NotBeforeError") {
      return ErrorFactory.authentication("Token not active");
    }

    return ErrorFactory.authentication("Token verification failed");
  }

  static handleMulterError(error) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return ErrorFactory.fileUpload("File too large");
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return ErrorFactory.fileUpload("Too many files");
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return ErrorFactory.fileUpload("Unexpected file field");
    }

    return ErrorFactory.fileUpload("File upload failed");
  }

  static isOperationalError(error) {
    return error instanceof AppError && error.isOperational;
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  FileUploadError,
  BusinessLogicError,
  ErrorFactory,
  ErrorFormatter,
  ErrorHandler,
};
