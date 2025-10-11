const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");
const {
  authenticate,
  authorize,
  userValidation,
  uploadUserAvatar,
} = require("../middleware");

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get("/profile", authenticate, userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  "/profile",
  authenticate,
  userValidation.updateProfile,
  userController.updateProfile
);

/**
 * @route   POST /api/users/avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post(
  "/avatar",
  authenticate,
  uploadUserAvatar,
  userController.uploadAvatar
);

/**
 * @route   GET /api/users/bookings
 * @desc    Get user's bookings
 * @access  Private
 */
router.get("/bookings", authenticate, userController.getUserBookings);

/**
 * @route   DELETE /api/users/me
 * @desc    Delete own account (soft delete)
 * @access  Private
 */
router.delete("/me", authenticate, userController.deleteMyAccount);

// Admin routes
/**
 * @route   GET /api/users
 * @desc    Get all users (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/",
  authenticate,
  authorize("admin", "staff"),
  userController.getAllUsers
);

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/stats",
  authenticate,
  authorize("admin", "staff"),
  userController.getUserStats
);

/**
 * @route   GET /api/users/search
 * @desc    Search users (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/search",
  authenticate,
  authorize("admin", "staff"),
  userController.searchUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/:id",
  authenticate,
  authorize("admin", "staff"),
  userController.getUserById
);

/**
 * @route   POST /api/users
 * @desc    Create new user (Admin only)
 * @access  Private/Admin
 */
router.post(
  "/",
  authenticate,
  authorize("admin"),
  userValidation.createUser,
  userController.createUser
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user by ID (Admin only)
 * @access  Private/Admin
 */
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  userValidation.updateUser,
  userController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user by ID (Admin only)
 * @access  Private/Admin
 */
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  userController.deleteUser
);

/**
 * @route   PUT /api/users/:id/activate
 * @desc    Activate user (Admin only)
 * @access  Private/Admin
 */
router.put(
  "/:id/activate",
  authenticate,
  authorize("admin"),
  userController.activateUser
);

/**
 * @route   PUT /api/users/:id/deactivate
 * @desc    Deactivate user (Admin only)
 * @access  Private/Admin
 */
router.put(
  "/:id/deactivate",
  authenticate,
  authorize("admin"),
  userController.deactivateUser
);

module.exports = router;
