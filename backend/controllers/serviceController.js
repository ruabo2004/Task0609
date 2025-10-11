// Service Controller
// Handles service management operations

const { Service, BookingService } = require("../models");
const {
  success,
  error,
  created,
  notFound,
  paginated,
} = require("../utils/responseHelper");
const { validationResult } = require("express-validator");

const serviceController = {
  // @desc    Get all services
  // @route   GET /api/services
  // @access  Public
  getAllServices: async (req, res, next) => {
    try {
      const filters = {
        category: req.query.category,
        is_active:
          req.query.is_active !== undefined
            ? req.query.is_active === "true"
            : undefined,
        min_price: req.query.min_price,
        max_price: req.query.max_price,
        search: req.query.search,
      };

      const services = await Service.getAll(filters);
      const serviceResponses = services.map((service) => service.toJSON());

      return success(
        res,
        { services: serviceResponses },
        "Services retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get active services only
  // @route   GET /api/services/active
  // @access  Public
  getActiveServices: async (req, res, next) => {
    try {
      const services = await Service.getActive();
      const serviceResponses = services.map((service) => service.toJSON());

      return success(
        res,
        { services: serviceResponses },
        "Active services retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get service by ID
  // @route   GET /api/services/:id
  // @access  Public
  getServiceById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const service = await Service.findById(id);
      if (!service) {
        return notFound(res, "Service not found");
      }

      const serviceResponse = service.toJSON();
      return success(
        res,
        { service: serviceResponse },
        "Service retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get services by category
  // @route   GET /api/services/category/:category
  // @access  Public
  getServicesByCategory: async (req, res, next) => {
    try {
      const { category } = req.params;

      const services = await Service.getByCategory(category);
      const serviceResponses = services.map((service) => service.toJSON());

      return success(
        res,
        {
          services: serviceResponses,
          category,
        },
        "Services by category retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Create new service (Admin/Staff only)
  // @route   POST /api/services
  // @access  Private/Admin/Staff
  createService: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "Validation failed", 400, errors.array());
      }

      const { name, description, price, category, is_active } = req.body;

      // Check if service name already exists
      const existingService = await Service.findByName(name);
      if (existingService) {
        return error(res, "Service name already exists", 409);
      }

      const serviceData = {
        name,
        description,
        price,
        category,
        is_active: is_active !== undefined ? is_active : true,
      };

      const service = await Service.create(serviceData);
      const serviceResponse = service.toJSON();

      return created(
        res,
        { service: serviceResponse },
        "Service created successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Update service (Admin/Staff only)
  // @route   PUT /api/services/:id
  // @access  Private/Admin/Staff
  updateService: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return error(res, "Validation failed", 400, errors.array());
      }

      const { id } = req.params;
      const { name, description, price, category, is_active } = req.body;

      const service = await Service.findById(id);
      if (!service) {
        return notFound(res, "Service not found");
      }

      // Check if name is being changed and already exists
      if (name && name !== service.name) {
        const existingService = await Service.findByName(name);
        if (existingService) {
          return error(res, "Service name already exists", 409);
        }
      }

      const updatedService = await service.update({
        name,
        description,
        price,
        category,
        is_active,
      });

      const serviceResponse = updatedService.toJSON();
      return success(
        res,
        { service: serviceResponse },
        "Service updated successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Delete service (Admin only)
  // @route   DELETE /api/services/:id
  // @access  Private/Admin
  deleteService: async (req, res, next) => {
    try {
      const { id } = req.params;

      const service = await Service.findById(id);
      if (!service) {
        return notFound(res, "Service not found");
      }

      const result = await service.delete();

      if (result.deactivated) {
        return success(
          res,
          null,
          "Service deactivated (has existing bookings)"
        );
      } else {
        return success(res, null, "Service deleted successfully");
      }
    } catch (err) {
      next(err);
    }
  },

  // @desc    Activate service (Admin/Staff only)
  // @route   PUT /api/services/:id/activate
  // @access  Private/Admin/Staff
  activateService: async (req, res, next) => {
    try {
      const { id } = req.params;

      const service = await Service.findById(id);
      if (!service) {
        return notFound(res, "Service not found");
      }

      const activatedService = await service.activate();
      const serviceResponse = activatedService.toJSON();

      return success(
        res,
        { service: serviceResponse },
        "Service activated successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Deactivate service (Admin/Staff only)
  // @route   PUT /api/services/:id/deactivate
  // @access  Private/Admin/Staff
  deactivateService: async (req, res, next) => {
    try {
      const { id } = req.params;

      const service = await Service.findById(id);
      if (!service) {
        return notFound(res, "Service not found");
      }

      const deactivatedService = await service.deactivate();
      const serviceResponse = deactivatedService.toJSON();

      return success(
        res,
        { service: serviceResponse },
        "Service deactivated successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get service categories
  // @route   GET /api/services/categories
  // @access  Public
  getServiceCategories: async (req, res, next) => {
    try {
      const categories = await Service.getCategories();

      return success(
        res,
        { categories },
        "Service categories retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get service statistics (Admin/Staff only)
  // @route   GET /api/services/stats
  // @access  Private/Admin/Staff
  getServiceStats: async (req, res, next) => {
    try {
      const stats = await Service.getStatistics();

      return success(
        res,
        { stats },
        "Service statistics retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get popular services (Admin/Staff only)
  // @route   GET /api/services/popular
  // @access  Private/Admin/Staff
  getPopularServices: async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const services = await Service.getPopularServices(limit);
      const serviceResponses = services.map((service) => service.toJSON());

      return success(
        res,
        { services: serviceResponses },
        "Popular services retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get service booking statistics
  // @route   GET /api/services/:id/stats
  // @access  Private/Admin/Staff
  getServiceBookingStats: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { start_date, end_date } = req.query;

      const service = await Service.findById(id);
      if (!service) {
        return notFound(res, "Service not found");
      }

      const bookingCount = await service.getBookingCount();
      const revenue = await service.getRevenue(start_date, end_date);

      const stats = {
        service_id: id,
        service_name: service.name,
        booking_count: bookingCount,
        total_revenue: revenue,
        period: start_date && end_date ? { start_date, end_date } : "all_time",
      };

      return success(
        res,
        { stats },
        "Service booking statistics retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },

  // @desc    Get service usage by bookings
  // @route   GET /api/services/:id/bookings
  // @access  Private/Admin/Staff
  getServiceBookings: async (req, res, next) => {
    try {
      const { id } = req.params;

      const service = await Service.findById(id);
      if (!service) {
        return notFound(res, "Service not found");
      }

      const bookings = await BookingService.getByServiceId(id);
      const bookingResponses = bookings.map((booking) => booking.toJSON());

      return success(
        res,
        {
          service: service.toJSON(),
          bookings: bookingResponses,
        },
        "Service bookings retrieved successfully"
      );
    } catch (err) {
      next(err);
    }
  },
};

// Merge placeholder methods
Object.assign(serviceController, require("./placeholders"));

module.exports = serviceController;
