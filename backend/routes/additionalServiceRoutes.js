const express = require("express");
const router = express.Router();
const additionalServiceController = require("../controllers/additionalServiceController");
const {
  authenticateToken,
  requireAdmin,
} = require("../middleware/authEnhanced");
const { body, query, param } = require("express-validator");

// Validation rules
const serviceValidation = {
  createService: [
    body("service_name")
      .notEmpty()
      .isLength({ min: 3, max: 255 })
      .withMessage("Service name must be between 3 and 255 characters"),
    body("service_type")
      .isIn(["food", "transport", "tour", "spa", "laundry", "other"])
      .withMessage("Invalid service type"),
    body("description")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Description must not exceed 1000 characters"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("unit")
      .optional()
      .isIn(["per_person", "per_room", "per_hour", "per_day", "fixed"])
      .withMessage("Invalid unit type"),
    body("availability_hours")
      .optional()
      .isArray()
      .withMessage("Availability hours must be an array"),
    body("advance_booking_required")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Advance booking required must be a non-negative integer"),
    body("max_quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Max quantity must be a positive integer"),
    body("images").optional().isArray().withMessage("Images must be an array"),
    body("status")
      .optional()
      .isIn(["active", "inactive"])
      .withMessage("Status must be active or inactive"),
  ],

  updateService: [
    body("service_name")
      .optional()
      .isLength({ min: 3, max: 255 })
      .withMessage("Service name must be between 3 and 255 characters"),
    body("service_type")
      .optional()
      .isIn(["food", "transport", "tour", "spa", "laundry", "other"])
      .withMessage("Invalid service type"),
    body("description")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Description must not exceed 1000 characters"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("unit")
      .optional()
      .isIn(["per_person", "per_room", "per_hour", "per_day", "fixed"])
      .withMessage("Invalid unit type"),
    body("availability_hours")
      .optional()
      .isArray()
      .withMessage("Availability hours must be an array"),
    body("advance_booking_required")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Advance booking required must be a non-negative integer"),
    body("max_quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Max quantity must be a positive integer"),
    body("images").optional().isArray().withMessage("Images must be an array"),
    body("status")
      .optional()
      .isIn(["active", "inactive"])
      .withMessage("Status must be active or inactive"),
  ],

  bookService: [
    body("booking_id")
      .isInt({ min: 1 })
      .withMessage("Booking ID must be a positive integer"),
    body("service_id")
      .isInt({ min: 1 })
      .withMessage("Service ID must be a positive integer"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be a positive integer"),
    body("service_date")
      .isISO8601()
      .withMessage("Service date must be a valid date"),
    body("service_time")
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Service time must be in HH:MM format"),
    body("notes")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Notes must not exceed 500 characters"),
  ],

  getServices: [
    query("type")
      .optional()
      .isIn(["food", "transport", "tour", "spa", "laundry", "other"])
      .withMessage("Invalid service type"),
    query("status")
      .optional()
      .isIn(["active", "inactive"])
      .withMessage("Invalid status"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("sort_by")
      .optional()
      .isIn(["service_name", "service_type", "price", "created_at"])
      .withMessage("Invalid sort field"),
    query("sort_order")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Sort order must be asc or desc"),
  ],

  getAvailableServices: [
    query("date")
      .optional()
      .isISO8601()
      .withMessage("Date must be a valid ISO8601 date"),
    query("time")
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Time must be in HH:MM format"),
  ],

  getStatistics: [
    query("timeframe")
      .optional()
      .isIn(["7d", "30d", "90d", "1y"])
      .withMessage("Timeframe must be one of: 7d, 30d, 90d, 1y"),
  ],
};

// ===============================================
// PUBLIC ROUTES (No authentication required)
// ===============================================

/**
 * GET /api/services
 * Get all additional services (public)
 */
router.get(
  "/",
  serviceValidation.getServices,
  additionalServiceController.getAllServices
);

/**
 * GET /api/services/:id
 * Get service by ID (public)
 */
router.get(
  "/:id",
  param("id")
    .isInt({ min: 1 })
    .withMessage("Service ID must be a positive integer"),
  additionalServiceController.getServiceById
);

/**
 * GET /api/services/type/:type
 * Get services by type (public)
 */
router.get(
  "/type/:type",
  param("type")
    .isIn(["food", "transport", "tour", "spa", "laundry", "other"])
    .withMessage("Invalid service type"),
  serviceValidation.getServices,
  additionalServiceController.getServicesByType
);

/**
 * GET /api/services/available
 * Get available services for booking (public)
 */
router.get(
  "/available",
  serviceValidation.getAvailableServices,
  additionalServiceController.getAvailableServices
);

// ===============================================
// AUTHENTICATED ROUTES (Customers can book services)
// ===============================================

/**
 * POST /api/services/book
 * Book an additional service (Customer only)
 */
router.post(
  "/book",
  authenticateToken,
  serviceValidation.bookService,
  additionalServiceController.bookService
);

// ===============================================
// ADMIN ROUTES (Service management)
// ===============================================

/**
 * POST /api/services/admin
 * Create new additional service (Admin only)
 */
router.post(
  "/admin",
  authenticateToken,
  requireAdmin,
  serviceValidation.createService,
  additionalServiceController.createService
);

/**
 * PUT /api/services/admin/:id
 * Update additional service (Admin only)
 */
router.put(
  "/admin/:id",
  authenticateToken,
  requireAdmin,
  param("id")
    .isInt({ min: 1 })
    .withMessage("Service ID must be a positive integer"),
  serviceValidation.updateService,
  additionalServiceController.updateService
);

/**
 * DELETE /api/services/admin/:id
 * Delete additional service (Admin only)
 */
router.delete(
  "/admin/:id",
  authenticateToken,
  requireAdmin,
  param("id")
    .isInt({ min: 1 })
    .withMessage("Service ID must be a positive integer"),
  additionalServiceController.deleteService
);

/**
 * GET /api/services/admin/statistics
 * Get service statistics (Admin only)
 */
router.get(
  "/admin/statistics",
  authenticateToken,
  requireAdmin,
  serviceValidation.getStatistics,
  additionalServiceController.getServiceStatistics
);

module.exports = router;
