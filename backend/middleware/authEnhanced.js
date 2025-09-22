const jwt = require("jsonwebtoken");
const config = require("../config/config");
const Customer = require("../models/Customer");

/**
 * Generate JWT token with role information
 */
const generateToken = (customer) => {
  return jwt.sign(
    {
      customer_id: customer.customer_id,
      email: customer.email,
      role: customer.role || "customer", // Dynamic role from database
      full_name: customer.full_name,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

/**
 * Enhanced authentication middleware with role support
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    const customer = await Customer.findById(decoded.customer_id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid token - user not found",
      });
    }

    // Check if account is active
    if (customer.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Account is inactive or banned",
      });
    }

    // Attach full user info to request
    req.user = customer;
    req.customer = customer; // Backward compatibility
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication error",
      error: error.message,
    });
  }
};

/**
 * Role-based authorization middleware
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        return res.status(401).json({
          success: false,
          message: "User role not found",
        });
      }

      // Convert single role to array
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${roles.join(
            " or "
          )}. Your role: ${userRole}`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Authorization error",
        error: error.message,
      });
    }
  };
};

/**
 * Specific role middlewares
 */
const requireAdmin = requireRole(["admin"]);
const requireStaff = requireRole(["staff", "admin"]);
const requireCustomer = requireRole(["customer", "staff", "admin"]);

/**
 * Permission-based authorization
 */
const requirePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      // Admin has all permissions
      if (user.role === "admin") {
        return next();
      }

      // For staff, check employee permissions
      if (user.role === "staff") {
        const Employee = require("../models/Employee");
        const employee = await Employee.findByCustomerId(user.customer_id);

        if (!employee) {
          return res.status(403).json({
            success: false,
            message: "Staff record not found",
          });
        }

        const permissions = employee.permissions || [];
        if (
          !permissions.includes(requiredPermission) &&
          !permissions.includes("*")
        ) {
          return res.status(403).json({
            success: false,
            message: `Access denied. Required permission: ${requiredPermission}`,
          });
        }
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Permission check error",
        error: error.message,
      });
    }
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      const customer = await Customer.findById(decoded.customer_id);
      if (customer && customer.status === "active") {
        req.user = customer;
        req.customer = customer;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Check if user owns resource or is admin/staff
 */
const requireOwnershipOrRole = (allowedRoles = ["admin", "staff"]) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      const resourceOwnerId =
        req.params.customerId ||
        req.body.customer_id ||
        req.customer?.customer_id;

      // Check if user is owner of the resource
      if (user.customer_id === parseInt(resourceOwnerId)) {
        return next();
      }

      // Check if user has allowed role
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      if (roles.includes(user.role)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message:
          "Access denied. You can only access your own resources or need higher privileges.",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Ownership check error",
        error: error.message,
      });
    }
  };
};

module.exports = {
  generateToken,
  authenticateToken,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireStaff,
  requireCustomer,
  requirePermission,
  requireOwnershipOrRole,
};
