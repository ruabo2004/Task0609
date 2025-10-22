// Authentication Middleware
// Handles JWT token verification and user authentication

const { verifyToken } = require("../utils/jwt");
const { User } = require("../models");
const { unauthorized, forbidden } = require("../utils/responseHelper");

/**
 * Middleware to authenticate user using JWT token
 * Adds user object to req.user if token is valid
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return unauthorized(res, "Access token is required");
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (tokenError) {
      if (tokenError.name === "TokenExpiredError") {
        return unauthorized(res, "Access token has expired");
      } else if (tokenError.name === "JsonWebTokenError") {
        return unauthorized(res, "Invalid access token");
      } else {
        return unauthorized(res, "Token verification failed");
      }
    }

    // Get user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      return unauthorized(res, "User not found");
    }

    // Check if user is active
    if (!user.is_active) {
      return unauthorized(res, "Account has been deactivated");
    }

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return unauthorized(res, "Authentication failed");
  }
};

/**
 * Optional authentication middleware
 * Adds user to req.user if token is provided and valid, but doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // No token provided, continue without user
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);

      if (user && user.is_active) {
        req.user = {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        };
      }
    } catch (tokenError) {
      // Token invalid, continue without user
    }

    next();
  } catch (error) {
    console.error("Optional authentication error:", error);
    next(); // Continue even if there's an error
  }
};

/**
 * Middleware to check if user has required role(s)
 * Must be used after authenticate middleware
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Flatten the allowedRoles array in case it's nested
    const flatRoles = allowedRoles.flat();
    if (!req.user) {
      return unauthorized(res, "Authentication required");
    }

    if (!flatRoles.includes(req.user.role)) {
      return forbidden(res, "Insufficient permissions");
    }
    next();
  };
};

/**
 * Middleware to check if user is admin
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return unauthorized(res, "Authentication required");
  }

  if (req.user.role !== "admin") {
    return forbidden(res, "Admin access required");
  }

  next();
};

/**
 * Middleware to check if user is staff or admin
 */
const staffOrAdmin = (req, res, next) => {
  if (!req.user) {
    return unauthorized(res, "Authentication required");
  }

  if (!["staff", "admin"].includes(req.user.role)) {
    return forbidden(res, "Staff or admin access required");
  }

  next();
};

/**
 * Middleware to check if user owns the resource or is admin/staff
 * Requires resourceUserId parameter in req.params or req.body
 */
const ownerOrStaff = (userIdField = "user_id") => {
  return (req, res, next) => {
    if (!req.user) {
      return unauthorized(res, "Authentication required");
    }

    // Admin and staff can access any resource
    if (["admin", "staff"].includes(req.user.role)) {
      return next();
    }

    // Get resource user ID from params or body
    const resourceUserId = req.params[userIdField] || req.body[userIdField];

    if (!resourceUserId) {
      return forbidden(res, "Resource ownership cannot be determined");
    }

    // Check if user owns the resource
    if (parseInt(resourceUserId) !== req.user.id) {
      return forbidden(
        res,
        "Access denied - you can only access your own resources"
      );
    }

    next();
  };
};

/**
 * Middleware to check if user can modify the resource
 * Similar to ownerOrStaff but only allows modification by owner or admin
 */
const ownerOrAdmin = (userIdField = "user_id") => {
  return (req, res, next) => {
    if (!req.user) {
      return unauthorized(res, "Authentication required");
    }

    // Admin can modify any resource
    if (req.user.role === "admin") {
      return next();
    }

    // Get resource user ID from params or body
    const resourceUserId = req.params[userIdField] || req.body[userIdField];

    if (!resourceUserId) {
      return forbidden(res, "Resource ownership cannot be determined");
    }

    // Check if user owns the resource
    if (parseInt(resourceUserId) !== req.user.id) {
      return forbidden(
        res,
        "Access denied - you can only modify your own resources"
      );
    }

    next();
  };
};

/**
 * Rate limiting middleware for auth endpoints
 */
const authRateLimit = (req, res, next) => {
  // This would typically use redis or memory store
  // For now, we'll just add headers and continue
  res.set({
    "X-RateLimit-Limit": "5",
    "X-RateLimit-Remaining": "4",
    "X-RateLimit-Reset": Date.now() + 15 * 60 * 1000, // 15 minutes
  });

  next();
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  adminOnly,
  staffOrAdmin,
  ownerOrStaff,
  ownerOrAdmin,
  authRateLimit,
};
