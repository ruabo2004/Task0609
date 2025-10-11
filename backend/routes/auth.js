const express = require("express");
const router = express.Router();
const { authController } = require("../controllers");
const { authenticate } = require("../middleware/auth");
const { userValidation } = require("../middleware");

/**
 * @route   POST /api/auth/lookup-account
 * @desc    Lookup account by ID number (CMND/CCCD)
 * @access  Public
 */
router.post("/lookup-account", authController.lookupAccount);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", userValidation.register, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post("/login", userValidation.login, authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT access token using refresh token
 * @access  Public
 */
router.post("/refresh", authController.refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate tokens
 * @access  Private
 */
router.post("/logout", authenticate, authController.logout);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post(
  "/change-password",
  authenticate,
  userValidation.changePassword,
  authController.changePassword
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get("/me", authenticate, authController.getCurrentUser);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post(
  "/forgot-password",
  userValidation.forgotPassword,
  authController.forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using reset token
 * @access  Public
 */
router.post(
  "/reset-password",
  userValidation.resetPassword,
  authController.resetPassword
);

module.exports = router;
