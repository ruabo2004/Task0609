const express = require("express");
const router = express.Router();
const seasonalPricingController = require("../controllers/seasonalPricingController");
const {
  authenticateToken,
  requireAdmin,
} = require("../middleware/authEnhanced");
const { body, query, param } = require("express-validator");

// Validation rules
const pricingValidation = {
  createPricing: [
    body("room_type_id")
      .isInt({ min: 1 })
      .withMessage("Room type ID must be a positive integer"),
    body("season_name")
      .notEmpty()
      .isLength({ min: 3, max: 100 })
      .withMessage("Season name must be between 3 and 100 characters"),
    body("start_date")
      .isISO8601()
      .withMessage("Start date must be a valid date"),
    body("end_date").isISO8601().withMessage("End date must be a valid date"),
    body("base_price")
      .isFloat({ min: 0 })
      .withMessage("Base price must be a positive number"),
    body("weekend_multiplier")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Weekend multiplier must be a positive number"),
    body("holiday_multiplier")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Holiday multiplier must be a positive number"),
    body("min_stay_nights")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Min stay nights must be a positive integer"),
    body("max_stay_nights")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Max stay nights must be a positive integer"),
    body("advance_booking_discount")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Advance booking discount must be between 0 and 100"),
    body("last_minute_surcharge")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Last minute surcharge must be between 0 and 100"),
    body("priority")
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage("Priority must be between 1 and 10"),
    body("status")
      .optional()
      .isIn(["active", "inactive"])
      .withMessage("Status must be active or inactive"),
  ],

  updatePricing: [
    body("season_name")
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage("Season name must be between 3 and 100 characters"),
    body("start_date")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid date"),
    body("end_date")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid date"),
    body("base_price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Base price must be a positive number"),
    body("weekend_multiplier")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Weekend multiplier must be a positive number"),
    body("holiday_multiplier")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Holiday multiplier must be a positive number"),
    body("min_stay_nights")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Min stay nights must be a positive integer"),
    body("max_stay_nights")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Max stay nights must be a positive integer"),
    body("advance_booking_discount")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Advance booking discount must be between 0 and 100"),
    body("last_minute_surcharge")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Last minute surcharge must be between 0 and 100"),
    body("priority")
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage("Priority must be between 1 and 10"),
    body("status")
      .optional()
      .isIn(["active", "inactive"])
      .withMessage("Status must be active or inactive"),
  ],

  getPricing: [
    query("room_type_id")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Room type ID must be a positive integer"),
    query("status")
      .optional()
      .isIn(["active", "inactive"])
      .withMessage("Status must be active or inactive"),
    query("year")
      .optional()
      .isInt({ min: 2020, max: 2030 })
      .withMessage("Year must be between 2020 and 2030"),
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
      .isIn(["start_date", "end_date", "season_name", "base_price", "priority"])
      .withMessage("Invalid sort field"),
    query("sort_order")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Sort order must be asc or desc"),
  ],

  getCurrentPricing: [
    query("check_in_date")
      .notEmpty()
      .isISO8601()
      .withMessage("Check-in date is required and must be a valid date"),
    query("check_out_date")
      .notEmpty()
      .isISO8601()
      .withMessage("Check-out date is required and must be a valid date"),
  ],

  getPricingCalendar: [
    query("start_date")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid date"),
    query("end_date")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid date"),
    query("months")
      .optional()
      .isInt({ min: 1, max: 12 })
      .withMessage("Months must be between 1 and 12"),
  ],

  bulkCreate: [
    body("template_name").notEmpty().withMessage("Template name is required"),
    body("year")
      .isInt({ min: 2020, max: 2030 })
      .withMessage("Year must be between 2020 and 2030"),
    body("room_type_ids")
      .isArray({ min: 1 })
      .withMessage("Room type IDs must be a non-empty array"),
    body("room_type_ids.*")
      .isInt({ min: 1 })
      .withMessage("Each room type ID must be a positive integer"),
  ],

  getStatistics: [
    query("year")
      .optional()
      .isInt({ min: 2020, max: 2030 })
      .withMessage("Year must be between 2020 and 2030"),
  ],
};

// ===============================================
// PUBLIC ROUTES (Pricing information)
// ===============================================

/**
 * GET /api/pricing/room-type/:roomTypeId
 * Get current pricing for a room type on specific dates
 */
router.get(
  "/room-type/:roomTypeId",
  param("roomTypeId")
    .isInt({ min: 1 })
    .withMessage("Room type ID must be a positive integer"),
  pricingValidation.getCurrentPricing,
  seasonalPricingController.getCurrentPricing
);

/**
 * GET /api/pricing/calendar/:roomTypeId
 * Get pricing calendar for a room type
 */
router.get(
  "/calendar/:roomTypeId",
  param("roomTypeId")
    .isInt({ min: 1 })
    .withMessage("Room type ID must be a positive integer"),
  pricingValidation.getPricingCalendar,
  seasonalPricingController.getPricingCalendar
);

// ===============================================
// ADMIN ROUTES (Seasonal pricing management)
// ===============================================

/**
 * POST /api/pricing/admin/seasons
 * Create seasonal pricing rule (Admin only)
 */
router.post(
  "/admin/seasons",
  authenticateToken,
  requireAdmin,
  pricingValidation.createPricing,
  seasonalPricingController.createSeasonalPricing
);

/**
 * GET /api/pricing/admin/seasons
 * Get all seasonal pricing rules (Admin only)
 */
router.get(
  "/admin/seasons",
  authenticateToken,
  requireAdmin,
  pricingValidation.getPricing,
  seasonalPricingController.getAllSeasonalPricing
);

/**
 * GET /api/pricing/admin/seasons/:id
 * Get seasonal pricing by ID (Admin only)
 */
router.get(
  "/admin/seasons/:id",
  authenticateToken,
  requireAdmin,
  param("id")
    .isInt({ min: 1 })
    .withMessage("Season pricing ID must be a positive integer"),
  seasonalPricingController.getSeasonalPricingById
);

/**
 * PUT /api/pricing/admin/seasons/:id
 * Update seasonal pricing (Admin only)
 */
router.put(
  "/admin/seasons/:id",
  authenticateToken,
  requireAdmin,
  param("id")
    .isInt({ min: 1 })
    .withMessage("Season pricing ID must be a positive integer"),
  pricingValidation.updatePricing,
  seasonalPricingController.updateSeasonalPricing
);

/**
 * DELETE /api/pricing/admin/seasons/:id
 * Delete seasonal pricing (Admin only)
 */
router.delete(
  "/admin/seasons/:id",
  authenticateToken,
  requireAdmin,
  param("id")
    .isInt({ min: 1 })
    .withMessage("Season pricing ID must be a positive integer"),
  seasonalPricingController.deleteSeasonalPricing
);

/**
 * GET /api/pricing/admin/statistics
 * Get seasonal pricing statistics (Admin only)
 */
router.get(
  "/admin/statistics",
  authenticateToken,
  requireAdmin,
  pricingValidation.getStatistics,
  seasonalPricingController.getPricingStatistics
);

/**
 * POST /api/pricing/admin/bulk-create
 * Bulk create seasonal pricing from template (Admin only)
 */
router.post(
  "/admin/bulk-create",
  authenticateToken,
  requireAdmin,
  pricingValidation.bulkCreate,
  seasonalPricingController.bulkCreateFromTemplate
);

/**
 * GET /api/pricing/admin/templates
 * Get available pricing templates (Admin only)
 */
router.get(
  "/admin/templates",
  authenticateToken,
  requireAdmin,
  seasonalPricingController.getPricingTemplates
);

module.exports = router;
