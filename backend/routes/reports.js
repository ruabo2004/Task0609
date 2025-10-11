const express = require("express");
const router = express.Router();
const { reportController } = require("../controllers");
const { authenticate, authorize, reportValidation } = require("../middleware");

/**
 * @route   GET /api/reports/overview
 * @desc    Get reports overview with all metrics (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/overview",
  authenticate,
  authorize("admin", "staff"),
  reportController.getReportsOverview
);

/**
 * @route   GET /api/reports/dashboard
 * @desc    Get business analytics dashboard (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/dashboard",
  authenticate,
  authorize("admin", "staff"),
  reportController.getDashboardAnalytics
);

/**
 * @route   GET /api/reports/revenue
 * @desc    Get revenue report (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/revenue",
  authenticate,
  authorize("admin", "staff"),
  reportController.getRevenueReport
);

/**
 * @route   GET /api/reports/bookings
 * @desc    Get booking analytics (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/bookings",
  authenticate,
  authorize("admin", "staff"),
  reportController.getBookingAnalytics
);

/**
 * @route   GET /api/reports/daily-summary
 * @desc    Get daily summary report (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/daily-summary",
  authenticate,
  authorize("admin", "staff"),
  reportController.getDailySummary
);

// Staff reports
/**
 * @route   GET /api/reports/staff
 * @desc    Get all staff reports (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/staff",
  authenticate,
  authorize("admin", "staff"),
  reportController.getAllStaffReports
);

/**
 * @route   GET /api/reports/staff/performance
 * @desc    Get staff performance statistics (Admin only)
 * @access  Private/Admin
 */
router.get(
  "/staff/performance",
  authenticate,
  authorize("admin"),
  reportController.getStaffPerformanceStatistics
);

/**
 * @route   GET /api/reports/staff/team-comparison
 * @desc    Get team performance comparison (Admin only)
 * @access  Private/Admin
 */
router.get(
  "/staff/team-comparison",
  authenticate,
  authorize("admin"),
  reportController.getTeamPerformanceComparison
);

/**
 * @route   GET /api/reports/staff/user
 * @desc    Get current user's reports (Staff only)
 * @access  Private/Staff
 */
router.get(
  "/staff/user",
  authenticate,
  authorize("staff"),
  reportController.getUserReports
);

/**
 * @route   GET /api/reports/staff/:id
 * @desc    Get staff report by ID (Admin/Staff only)
 * @access  Private/Admin/Staff
 */
router.get(
  "/staff/:id",
  authenticate,
  authorize("admin", "staff"),
  reportController.getStaffReportById
);

/**
 * @route   POST /api/reports/staff
 * @desc    Create staff report (Staff only)
 * @access  Private/Staff
 */
router.post(
  "/staff",
  authenticate,
  authorize("staff"),
  reportValidation.createStaffReport,
  reportController.createStaffReport
);

/**
 * @route   PUT /api/reports/staff/:id
 * @desc    Update staff report (Staff only - own reports)
 * @access  Private/Staff
 */
router.put(
  "/staff/:id",
  authenticate,
  authorize("staff"),
  reportValidation.updateStaffReport,
  reportController.updateStaffReport
);

/**
 * @route   POST /api/reports/staff/auto-generate
 * @desc    Auto-generate staff report (Staff only)
 * @access  Private/Staff
 */
router.post(
  "/staff/auto-generate",
  authenticate,
  authorize("staff"),
  reportController.autoGenerateStaffReport
);

module.exports = router;
