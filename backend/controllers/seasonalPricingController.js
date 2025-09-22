const SeasonalPricing = require("../models/SeasonalPricing");
const Room = require("../models/Room");
const { validationResult } = require("express-validator");

/**
 * Create seasonal pricing rule
 * @route POST /api/admin/pricing/seasons
 */
const createSeasonalPricing = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const pricingData = req.body;
    const pricing = await SeasonalPricing.create(pricingData);

    res.status(201).json({
      success: true,
      message: "Seasonal pricing created successfully",
      data: { pricing },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create seasonal pricing",
      error: error.message,
    });
  }
};

/**
 * Get all seasonal pricing rules
 * @route GET /api/admin/pricing/seasons
 */
const getAllSeasonalPricing = async (req, res) => {
  try {
    const {
      room_type_id,
      status = "active",
      year,
      page = 1,
      limit = 20,
      sort_by = "start_date",
      sort_order = "asc",
    } = req.query;

    const filters = {
      room_type_id: room_type_id ? parseInt(room_type_id) : null,
      status,
      year: year ? parseInt(year) : null,
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy: sort_by,
      sortOrder: sort_order,
    };

    const result = await SeasonalPricing.getAllWithFilters(filters);

    res.json({
      success: true,
      message: "Seasonal pricing rules retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get seasonal pricing",
      error: error.message,
    });
  }
};

/**
 * Get seasonal pricing by ID
 * @route GET /api/admin/pricing/seasons/:id
 */
const getSeasonalPricingById = async (req, res) => {
  try {
    const { id } = req.params;
    const pricing = await SeasonalPricing.findByIdWithDetails(id);

    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: "Seasonal pricing not found",
      });
    }

    res.json({
      success: true,
      message: "Seasonal pricing retrieved successfully",
      data: { pricing },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get seasonal pricing",
      error: error.message,
    });
  }
};

/**
 * Update seasonal pricing
 * @route PUT /api/admin/pricing/seasons/:id
 */
const updateSeasonalPricing = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const pricing = await SeasonalPricing.findById(id);
    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: "Seasonal pricing not found",
      });
    }

    const updatedPricing = await SeasonalPricing.update(id, updateData);

    res.json({
      success: true,
      message: "Seasonal pricing updated successfully",
      data: { pricing: updatedPricing },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update seasonal pricing",
      error: error.message,
    });
  }
};

/**
 * Delete seasonal pricing
 * @route DELETE /api/admin/pricing/seasons/:id
 */
const deleteSeasonalPricing = async (req, res) => {
  try {
    const { id } = req.params;

    const pricing = await SeasonalPricing.findById(id);
    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: "Seasonal pricing not found",
      });
    }

    await SeasonalPricing.delete(id);

    res.json({
      success: true,
      message: "Seasonal pricing deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete seasonal pricing",
      error: error.message,
    });
  }
};

/**
 * Get current pricing for a room type on specific dates
 * @route GET /api/pricing/room-type/:roomTypeId
 */
const getCurrentPricing = async (req, res) => {
  try {
    const { roomTypeId } = req.params;
    const { check_in_date, check_out_date } = req.query;

    if (!check_in_date || !check_out_date) {
      return res.status(400).json({
        success: false,
        message: "Check-in and check-out dates are required",
      });
    }

    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);

    if (checkIn >= checkOut) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
      });
    }

    const pricingDetails = await SeasonalPricing.getPricingForDateRange(
      roomTypeId,
      checkIn,
      checkOut
    );

    res.json({
      success: true,
      message: "Pricing retrieved successfully",
      data: pricingDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get current pricing",
      error: error.message,
    });
  }
};

/**
 * Get pricing calendar for a room type
 * @route GET /api/pricing/calendar/:roomTypeId
 */
const getPricingCalendar = async (req, res) => {
  try {
    const { roomTypeId } = req.params;
    const {
      start_date = new Date().toISOString().split("T")[0],
      end_date,
      months = 3,
    } = req.query;

    let endDate;
    if (end_date) {
      endDate = new Date(end_date);
    } else {
      endDate = new Date(start_date);
      endDate.setMonth(endDate.getMonth() + parseInt(months));
    }

    const calendar = await SeasonalPricing.getPricingCalendar(
      roomTypeId,
      new Date(start_date),
      endDate
    );

    res.json({
      success: true,
      message: "Pricing calendar retrieved successfully",
      data: {
        room_type_id: parseInt(roomTypeId),
        start_date,
        end_date: endDate.toISOString().split("T")[0],
        calendar,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get pricing calendar",
      error: error.message,
    });
  }
};

/**
 * Get seasonal pricing statistics
 * @route GET /api/admin/pricing/statistics
 */
const getPricingStatistics = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const statistics = await SeasonalPricing.getStatistics(year);

    res.json({
      success: true,
      message: "Pricing statistics retrieved successfully",
      data: statistics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get pricing statistics",
      error: error.message,
    });
  }
};

/**
 * Bulk create seasonal pricing from template
 * @route POST /api/admin/pricing/bulk-create
 */
const bulkCreateFromTemplate = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { template_name, year, room_type_ids } = req.body;

    const result = await SeasonalPricing.bulkCreateFromTemplate(
      template_name,
      year,
      room_type_ids
    );

    res.status(201).json({
      success: true,
      message: "Seasonal pricing created from template successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to bulk create seasonal pricing",
      error: error.message,
    });
  }
};

/**
 * Get available pricing templates
 * @route GET /api/admin/pricing/templates
 */
const getPricingTemplates = async (req, res) => {
  try {
    const templates = await SeasonalPricing.getTemplates();

    res.json({
      success: true,
      message: "Pricing templates retrieved successfully",
      data: { templates },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get pricing templates",
      error: error.message,
    });
  }
};

module.exports = {
  createSeasonalPricing,
  getAllSeasonalPricing,
  getSeasonalPricingById,
  updateSeasonalPricing,
  deleteSeasonalPricing,
  getCurrentPricing,
  getPricingCalendar,
  getPricingStatistics,
  bulkCreateFromTemplate,
  getPricingTemplates,
};
