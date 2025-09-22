const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const {
  authenticateToken,
  requireAdmin,
} = require("../middleware/authEnhanced");
const { query } = require("express-validator");

// Validation rules
const analyticsValidation = {
  timeframe: [
    query("timeframe")
      .optional()
      .isIn(["7d", "30d", "90d", "1y"])
      .withMessage("Timeframe must be one of: 7d, 30d, 90d, 1y"),
  ],

  dateRange: [
    query("start_date")
      .notEmpty()
      .isISO8601()
      .withMessage("Start date is required and must be a valid date"),
    query("end_date")
      .notEmpty()
      .isISO8601()
      .withMessage("End date is required and must be a valid date"),
  ],

  occupancyAnalytics: [
    query("start_date")
      .notEmpty()
      .isISO8601()
      .withMessage("Start date is required and must be a valid date"),
    query("end_date")
      .notEmpty()
      .isISO8601()
      .withMessage("End date is required and must be a valid date"),
    query("room_type_id")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Room type ID must be a positive integer"),
    query("granularity")
      .optional()
      .isIn(["daily", "weekly", "monthly", "total"])
      .withMessage("Granularity must be one of: daily, weekly, monthly, total"),
  ],

  revenueAnalytics: [
    query("start_date")
      .notEmpty()
      .isISO8601()
      .withMessage("Start date is required and must be a valid date"),
    query("end_date")
      .notEmpty()
      .isISO8601()
      .withMessage("End date is required and must be a valid date"),
    query("granularity")
      .optional()
      .isIn(["daily", "weekly", "monthly"])
      .withMessage("Granularity must be one of: daily, weekly, monthly"),
    query("include_services")
      .optional()
      .isBoolean()
      .withMessage("Include services must be a boolean"),
  ],

  bookingAnalytics: [
    query("start_date")
      .notEmpty()
      .isISO8601()
      .withMessage("Start date is required and must be a valid date"),
    query("end_date")
      .notEmpty()
      .isISO8601()
      .withMessage("End date is required and must be a valid date"),
    query("granularity")
      .optional()
      .isIn(["daily", "weekly", "monthly"])
      .withMessage("Granularity must be one of: daily, weekly, monthly"),
  ],

  customerAnalytics: [
    query("start_date")
      .notEmpty()
      .isISO8601()
      .withMessage("Start date is required and must be a valid date"),
    query("end_date")
      .notEmpty()
      .isISO8601()
      .withMessage("End date is required and must be a valid date"),
    query("segment")
      .optional()
      .isIn(["all", "new", "returning", "vip"])
      .withMessage("Segment must be one of: all, new, returning, vip"),
  ],

  forecastData: [
    query("type")
      .optional()
      .isIn(["occupancy", "revenue", "bookings"])
      .withMessage("Type must be one of: occupancy, revenue, bookings"),
    query("period")
      .optional()
      .isIn(["7d", "30d", "90d"])
      .withMessage("Period must be one of: 7d, 30d, 90d"),
    query("room_type_id")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Room type ID must be a positive integer"),
  ],

  comparativeAnalytics: [
    query("current_start")
      .notEmpty()
      .isISO8601()
      .withMessage("Current start date is required and must be a valid date"),
    query("current_end")
      .notEmpty()
      .isISO8601()
      .withMessage("Current end date is required and must be a valid date"),
    query("previous_start")
      .notEmpty()
      .isISO8601()
      .withMessage("Previous start date is required and must be a valid date"),
    query("previous_end")
      .notEmpty()
      .isISO8601()
      .withMessage("Previous end date is required and must be a valid date"),
    query("metrics")
      .optional()
      .matches(/^(revenue|occupancy|bookings)(,(revenue|occupancy|bookings))*$/)
      .withMessage(
        "Metrics must be a comma-separated list of: revenue, occupancy, bookings"
      ),
  ],

  exportAnalytics: [
    query("type")
      .notEmpty()
      .isIn(["dashboard", "occupancy", "revenue", "bookings", "customers"])
      .withMessage(
        "Export type is required and must be one of: dashboard, occupancy, revenue, bookings, customers"
      ),
    query("format")
      .optional()
      .isIn(["json", "csv"])
      .withMessage("Format must be json or csv"),
    query("start_date")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid date"),
    query("end_date")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid date"),
  ],
};

// ===============================================
// ADMIN ANALYTICS ROUTES (All require admin authentication)
// ===============================================

/**
 * GET /api/analytics/dashboard
 * Get dashboard analytics overview
 */
router.get(
  "/dashboard",
  authenticateToken,
  requireAdmin,
  analyticsValidation.timeframe,
  analyticsController.getDashboardAnalytics
);

/**
 * GET /api/analytics/occupancy
 * Get occupancy rate analytics
 */
router.get(
  "/occupancy",
  authenticateToken,
  requireAdmin,
  analyticsValidation.occupancyAnalytics,
  analyticsController.getOccupancyAnalytics
);

/**
 * GET /api/analytics/revenue
 * Get revenue analytics
 */
router.get(
  "/revenue",
  authenticateToken,
  requireAdmin,
  analyticsValidation.revenueAnalytics,
  analyticsController.getRevenueAnalytics
);

/**
 * GET /api/analytics/bookings
 * Get booking analytics
 */
router.get(
  "/bookings",
  authenticateToken,
  requireAdmin,
  analyticsValidation.bookingAnalytics,
  analyticsController.getBookingAnalytics
);

/**
 * GET /api/analytics/customers
 * Get customer analytics
 */
router.get(
  "/customers",
  authenticateToken,
  requireAdmin,
  analyticsValidation.customerAnalytics,
  analyticsController.getCustomerAnalytics
);

/**
 * GET /api/analytics/performance
 * Get performance metrics
 */
router.get(
  "/performance",
  authenticateToken,
  requireAdmin,
  analyticsValidation.timeframe,
  analyticsController.getPerformanceMetrics
);

/**
 * GET /api/analytics/forecast
 * Get forecasting data
 */
router.get(
  "/forecast",
  authenticateToken,
  requireAdmin,
  analyticsValidation.forecastData,
  analyticsController.getForecastData
);

/**
 * GET /api/analytics/compare
 * Get comparative analytics
 */
router.get(
  "/compare",
  authenticateToken,
  requireAdmin,
  analyticsValidation.comparativeAnalytics,
  analyticsController.getComparativeAnalytics
);

/**
 * GET /api/analytics/export
 * Export analytics data
 */
router.get(
  "/export",
  authenticateToken,
  requireAdmin,
  analyticsValidation.exportAnalytics,
  analyticsController.exportAnalytics
);

/**
 * GET /api/analytics/realtime
 * Get real-time metrics
 */
router.get(
  "/realtime",
  authenticateToken,
  requireAdmin,
  analyticsController.getRealTimeMetrics
);

module.exports = router;
