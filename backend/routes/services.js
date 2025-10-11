const express = require("express");
const router = express.Router();
const { serviceController } = require("../controllers");
const { authenticate, authorize, serviceValidation } = require("../middleware");

/**
 * @route   GET /api/services
 * @desc    Get all services
 * @access  Public
 */
router.get("/", serviceController.getAllServices);

/**
 * @route   GET /api/services/active
 * @desc    Get active services only
 * @access  Public
 */
router.get("/active", serviceController.getActiveServices);

/**
 * @route   GET /api/services/categories
 * @desc    Get service categories
 * @access  Public
 */
router.get("/categories", serviceController.getServiceCategories);

/**
 * @route   GET /api/services/popular
 * @desc    Get popular services
 * @access  Public
 */
router.get("/popular", serviceController.getPopularServices);

/**
 * @route   GET /api/services/stats
 * @desc    Get service statistics (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/stats",
  authenticate,
  authorize("admin", "staff"),
  serviceController.getServiceStatistics
);

/**
 * @route   GET /api/services/category/:category
 * @desc    Get services by category
 * @access  Public
 */
router.get("/category/:category", serviceController.getServicesByCategory);

/**
 * @route   GET /api/services/:id
 * @desc    Get service by ID
 * @access  Public
 */
router.get("/:id", serviceController.getServiceById);

/**
 * @route   GET /api/services/:id/booking-stats
 * @desc    Get service booking statistics (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/:id/booking-stats",
  authenticate,
  authorize("admin", "staff"),
  serviceController.getServiceBookingStatistics
);

/**
 * @route   GET /api/services/:id/usage
 * @desc    Get service usage by bookings (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/:id/usage",
  authenticate,
  authorize("admin", "staff"),
  serviceController.getServiceUsageByBookings
);

// Admin/Staff routes
/**
 * @route   POST /api/services
 * @desc    Create new service (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.post(
  "/",
  authenticate,
  authorize("admin", "staff"),
  serviceValidation.createService,
  serviceController.createService
);

/**
 * @route   PUT /api/services/:id
 * @desc    Update service (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.put(
  "/:id",
  authenticate,
  authorize("admin", "staff"),
  serviceValidation.updateService,
  serviceController.updateService
);

/**
 * @route   DELETE /api/services/:id
 * @desc    Delete service (Admin only)
 * @access  Private/Admin
 */
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  serviceController.deleteService
);

/**
 * @route   PUT /api/services/:id/activate
 * @desc    Activate service (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.put(
  "/:id/activate",
  authenticate,
  authorize("admin", "staff"),
  serviceController.activateService
);

/**
 * @route   PUT /api/services/:id/deactivate
 * @desc    Deactivate service (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.put(
  "/:id/deactivate",
  authenticate,
  authorize("admin", "staff"),
  serviceController.deactivateService
);

module.exports = router;
