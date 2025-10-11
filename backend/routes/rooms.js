const express = require("express");
const router = express.Router();
const { roomController } = require("../controllers");
const {
  authenticate,
  authorize,
  roomValidation,
  uploadRoomImages,
} = require("../middleware");

/**
 * @route   GET /api/rooms
 * @desc    Get all rooms with filtering and pagination
 * @access  Public
 */
router.get("/", roomController.getAllRooms);

/**
 * @route   GET /api/rooms/available
 * @desc    Get available rooms for specific dates
 * @access  Public
 */
router.get(
  "/available",
  roomValidation.checkAvailability,
  roomController.getAvailableRooms
);

/**
 * @route   GET /api/rooms/types
 * @desc    Get room types
 * @access  Public
 */
router.get("/types", roomController.getRoomTypes);

/**
 * @route   GET /api/rooms/stats
 * @desc    Get room statistics (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/stats",
  authenticate,
  authorize("admin", "staff"),
  roomController.getRoomStatistics
);

/**
 * @route   GET /api/rooms/search
 * @desc    Search rooms
 * @access  Public
 */
router.get("/search", roomController.searchRooms);

/**
 * @route   GET /api/rooms/:id
 * @desc    Get room by ID
 * @access  Public
 */
router.get("/:id", roomController.getRoomById);

/**
 * @route   GET /api/rooms/:id/booked-dates
 * @desc    Get booked dates for a specific room
 * @access  Public
 */
router.get("/:id/booked-dates", roomController.getRoomBookedDates);

/**
 * @route   GET /api/rooms/:id/reviews
 * @desc    Get reviews for a specific room
 * @access  Public
 */
router.get("/:id/reviews", roomController.getRoomReviews);

/**
 * @route   GET /api/rooms/:id/bookings
 * @desc    Get bookings for a specific room (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/:id/bookings",
  authenticate,
  authorize("admin", "staff"),
  roomController.getRoomBookings
);

// Admin/Staff routes
/**
 * @route   POST /api/rooms
 * @desc    Create new room (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.post(
  "/",
  authenticate,
  authorize("admin", "staff"),
  roomValidation.createRoom,
  roomController.createRoom
);

/**
 * @route   PUT /api/rooms/:id
 * @desc    Update room by ID (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.put(
  "/:id",
  authenticate,
  authorize("admin", "staff"),
  roomValidation.updateRoom,
  roomController.updateRoom
);

/**
 * @route   DELETE /api/rooms/:id
 * @desc    Delete room by ID (Admin only)
 * @access  Private/Admin
 */
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  roomController.deleteRoom
);

/**
 * @route   POST /api/rooms/:id/images
 * @desc    Upload room images (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.post(
  "/:id/images",
  authenticate,
  authorize("admin", "staff"),
  uploadRoomImages,
  roomController.uploadRoomImages
);

/**
 * @route   PUT /api/rooms/:id/status
 * @desc    Update room status (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.put(
  "/:id/status",
  authenticate,
  authorize("admin", "staff"),
  roomValidation.updateStatus,
  roomController.updateRoomStatus
);

module.exports = router;
