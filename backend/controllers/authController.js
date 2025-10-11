// Authentication Controller
// Enhanced with comprehensive error handling and logging

const { User } = require("../models");
const {
  generateTokenPair,
  verifyToken,
  blacklistToken,
} = require("../utils/jwt");
const {
  success,
  error,
  created,
  unauthorized,
} = require("../utils/responseHelper");
const { validationResult } = require("express-validator");
const { logger } = require("../utils/logger");
const { ErrorFactory, ErrorHandler } = require("../utils/errors");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const authController = {
  // @desc    Lookup account by ID number (CMND/CCCD)
  // @route   POST /api/auth/lookup-account
  // @access  Public
  lookupAccount: async (req, res, next) => {
    try {
      const { id_number } = req.body;

      if (!id_number) {
        return error(res, "Số CMND/CCCD là bắt buộc", 400);
      }

      // Validate ID number format (9 or 12 digits)
      if (!/^[0-9]{9}$|^[0-9]{12}$/.test(id_number)) {
        return error(res, "Số CMND/CCCD phải có 9 hoặc 12 chữ số", 400);
      }

      // Find user by ID number
      const { executeQuery } = require("../config/database");
      const query = `
        SELECT id, email, full_name, phone
        FROM users
        WHERE id_number = ? AND is_active = 1
      `;
      const users = await executeQuery(query, [id_number]);

      if (users.length === 0) {
        return error(res, "Không tìm thấy tài khoản với số CMND/CCCD này", 404);
      }

      const user = users[0];

      // Generate a temporary password in format D@XXXXXX (6 random digits)
      const randomDigits = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit number
      const tempPassword = `D@${randomDigits}`;

      // Hash the temporary password
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      // Update user's password with the temporary one
      await executeQuery("UPDATE users SET password = ? WHERE id = ?", [
        hashedPassword,
        user.id,
      ]);

      logger.info(`Temporary password generated for user ${user.email}`);

      // Return account information with temporary password
      return success(
        res,
        {
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          password: tempPassword, // Return the temporary password in plain text
        },
        "Tìm thấy tài khoản thành công. Mật khẩu tạm thời đã được tạo."
      );
    } catch (err) {
      logger.error("Lookup account error:", err);
      next(err);
    }
  },

  // @desc    Register new user
  // @route   POST /api/auth/register
  // @access  Public
  register: async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "Validation failed", 400, errors.array());
      }

      const { email, password, full_name, phone, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return error(res, "Email already registered", 409);
      }

      // Create new user
      const userData = {
        email,
        password,
        full_name,
        phone,
        role: role || "customer", // Default to customer
      };

      const user = await User.create(userData);
      if (!user) {
        return error(res, "Failed to create user", 500);
      }

      // Generate tokens
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      const tokens = generateTokenPair(tokenPayload);

      // Return user data without password
      const userResponse = user.toJSON();

      return created(
        res,
        {
          user: userResponse,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        "User registered successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Login user
  // @route   POST /api/auth/login
  // @access  Public
  login: async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "Validation failed", 400, errors.array());
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return unauthorized(res, "Invalid email or password");
      }

      // Check if user is active
      if (!user.is_active) {
        return unauthorized(res, "Account has been deactivated");
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return unauthorized(res, "Invalid email or password");
      }

      // Generate tokens
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      const tokens = generateTokenPair(tokenPayload);

      // Return user data without password
      const userResponse = user.toJSON();

      return success(
        res,
        {
          user: userResponse,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        "Login successful"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Refresh access token
  // @route   POST /api/auth/refresh
  // @access  Public
  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return unauthorized(res, "Refresh token is required");
      }

      // Verify refresh token
      let decoded;
      try {
        decoded = verifyToken(refreshToken);
      } catch (tokenError) {
        return unauthorized(res, "Invalid or expired refresh token");
      }

      // Find user to ensure they still exist and are active
      const user = await User.findById(decoded.id);
      if (!user || !user.is_active) {
        return unauthorized(res, "User not found or inactive");
      }

      // Generate new tokens
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      const tokens = generateTokenPair(tokenPayload);

      return success(
        res,
        {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        "Token refreshed successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Logout user
  // @route   POST /api/auth/logout
  // @access  Private
  logout: async (req, res, next) => {
    try {
      // In a production environment, you might want to:
      // 1. Add the token to a blacklist
      // 2. Store refresh tokens in database and remove them
      // 3. Clear any server-side sessions

      // For now, we'll just return success as the client should remove tokens
      return success(res, null, "Logout successful");
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get current user profile
  // @route   GET /api/auth/me
  // @access  Private
  getCurrentUser: async (req, res, next) => {
    try {
      // User is attached to req by auth middleware
      const user = await User.findById(req.user.id);
      if (!user) {
        return error(res, "User not found", 404);
      }

      const userResponse = user.toJSON();
      return success(res, { user: userResponse }, "User profile retrieved");
    } catch (err) {
      next(err);
    }
  },

  // @desc    Change password
  // @route   PUT /api/auth/change-password
  // @access  Private
  changePassword: async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return error(
          res,
          "Current password and new password are required",
          400
        );
      }

      // Get current user
      const user = await User.findById(req.user.id);
      if (!user) {
        return error(res, "User not found", 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        return unauthorized(res, "Current password is incorrect");
      }

      // Validate new password strength (basic validation)
      if (newPassword.length < 6) {
        return error(
          res,
          "New password must be at least 6 characters long",
          400
        );
      }

      // Hash and update password
      const bcrypt = require("bcryptjs");
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password in database
      const { executeQuery } = require("../config/database");
      await executeQuery(
        "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [hashedPassword, user.id]
      );

      return success(res, null, "Password changed successfully");
    } catch (err) {
      next(err);
    }
  },

  // @desc    Request password reset
  // @route   POST /api/auth/forgot-password
  // @access  Public
  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;

      if (!email) {
        return error(res, "Email is required", 400);
      }

      const user = await User.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists for security
        return success(
          res,
          null,
          "If email exists, password reset instructions have been sent"
        );
      }

      // In a real application, you would:
      // 1. Generate a reset token
      // 2. Store it in database with expiration
      // 3. Send email with reset link

      // For now, just return success
      return success(
        res,
        null,
        "If email exists, password reset instructions have been sent"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Reset password
  // @route   POST /api/auth/reset-password
  // @access  Public
  resetPassword: async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return error(res, "Token and new password are required", 400);
      }

      // In a real application, you would:
      // 1. Verify the reset token
      // 2. Check if it's not expired
      // 3. Update the user's password
      // 4. Remove the reset token

      // For now, just return success
      return success(res, null, "Password reset successful");
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
