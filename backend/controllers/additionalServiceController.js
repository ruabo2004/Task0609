const AdditionalService = require("../models/AdditionalService");
const { validationResult } = require("express-validator");

/**
 * Get all additional services
 * @route GET /api/services
 */
const getAllServices = async (req, res) => {
  try {
    const {
      type,
      status = "active",
      page = 1,
      limit = 20,
      sort_by = "created_at",
      sort_order = "desc",
    } = req.query;

    const filters = {
      service_type: type,
      status,
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy: sort_by,
      sortOrder: sort_order,
    };

    const services = await AdditionalService.getAllWithFilters(filters);

    res.json({
      success: true,
      message: "Additional services retrieved successfully",
      data: services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get additional services",
      error: error.message,
    });
  }
};

/**
 * Get service by ID
 * @route GET /api/services/:id
 */
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await AdditionalService.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Additional service not found",
      });
    }

    res.json({
      success: true,
      message: "Additional service retrieved successfully",
      data: { service },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get additional service",
      error: error.message,
    });
  }
};

/**
 * Create new additional service (Admin only)
 * @route POST /api/admin/services
 */
const createService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const serviceData = req.body;
    const service = await AdditionalService.create(serviceData);

    res.status(201).json({
      success: true,
      message: "Additional service created successfully",
      data: { service },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create additional service",
      error: error.message,
    });
  }
};

/**
 * Update additional service (Admin only)
 * @route PUT /api/admin/services/:id
 */
const updateService = async (req, res) => {
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

    const service = await AdditionalService.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Additional service not found",
      });
    }

    const updatedService = await AdditionalService.update(id, updateData);

    res.json({
      success: true,
      message: "Additional service updated successfully",
      data: { service: updatedService },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update additional service",
      error: error.message,
    });
  }
};

/**
 * Delete additional service (Admin only)
 * @route DELETE /api/admin/services/:id
 */
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await AdditionalService.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Additional service not found",
      });
    }

    await AdditionalService.delete(id);

    res.json({
      success: true,
      message: "Additional service deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete additional service",
      error: error.message,
    });
  }
};

/**
 * Get services by type
 * @route GET /api/services/type/:type
 */
const getServicesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { status = "active", page = 1, limit = 20 } = req.query;

    const filters = {
      service_type: type,
      status,
      page: parseInt(page),
      limit: parseInt(limit),
    };

    const services = await AdditionalService.getAllWithFilters(filters);

    res.json({
      success: true,
      message: `${type} services retrieved successfully`,
      data: services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get services by type",
      error: error.message,
    });
  }
};

/**
 * Get available services for booking
 * @route GET /api/services/available
 */
const getAvailableServices = async (req, res) => {
  try {
    const { date, time } = req.query;

    const availableServices = await AdditionalService.getAvailableServices(
      date,
      time
    );

    res.json({
      success: true,
      message: "Available services retrieved successfully",
      data: { services: availableServices },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get available services",
      error: error.message,
    });
  }
};

/**
 * Book additional service
 * @route POST /api/services/book
 */
const bookService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const {
      booking_id,
      service_id,
      quantity,
      service_date,
      service_time,
      notes,
    } = req.body;
    const customer_id = req.customer.customer_id;

    // Verify booking belongs to customer
    const BookingService = require("../models/BookingService");
    const booking = await BookingService.getBookingById(booking_id);

    if (!booking || booking.customer_id !== customer_id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to book service for this booking",
      });
    }

    const service = await AdditionalService.findById(service_id);
    if (!service || service.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Service not available",
      });
    }

    const bookingServiceData = {
      booking_id,
      service_id,
      quantity,
      unit_price: service.price,
      total_price: service.price * quantity,
      service_date,
      service_time,
      notes,
    };

    const bookingService = await BookingService.create(bookingServiceData);

    res.status(201).json({
      success: true,
      message: "Service booked successfully",
      data: { booking_service: bookingService },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to book service",
      error: error.message,
    });
  }
};

/**
 * Get service statistics (Admin only)
 * @route GET /api/admin/services/statistics
 */
const getServiceStatistics = async (req, res) => {
  try {
    const { timeframe = "30d" } = req.query;

    const statistics = await AdditionalService.getStatistics(timeframe);

    res.json({
      success: true,
      message: "Service statistics retrieved successfully",
      data: statistics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get service statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServicesByType,
  getAvailableServices,
  bookService,
  getServiceStatistics,
};
