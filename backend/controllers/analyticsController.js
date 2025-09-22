const Analytics = require("../models/Analytics");
const { validationResult } = require("express-validator");

/**
 * Get dashboard analytics overview
 * @route GET /api/admin/analytics/dashboard
 */
const getDashboardAnalytics = async (req, res) => {
  try {
    const { timeframe = "30d" } = req.query;

    const analytics = await Analytics.getDashboardOverview(timeframe);

    res.json({
      success: true,
      message: "Dashboard analytics retrieved successfully",
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get dashboard analytics",
      error: error.message,
    });
  }
};

/**
 * Get occupancy rate analytics
 * @route GET /api/admin/analytics/occupancy
 */
const getOccupancyAnalytics = async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      room_type_id,
      granularity = "daily",
    } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const analytics = await Analytics.getOccupancyRate(
      new Date(start_date),
      new Date(end_date),
      room_type_id ? parseInt(room_type_id) : null,
      granularity
    );

    res.json({
      success: true,
      message: "Occupancy analytics retrieved successfully",
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get occupancy analytics",
      error: error.message,
    });
  }
};

/**
 * Get revenue analytics
 * @route GET /api/admin/analytics/revenue
 */
const getRevenueAnalytics = async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      granularity = "daily",
      include_services = "true",
    } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const analytics = await Analytics.getRevenueAnalytics(
      new Date(start_date),
      new Date(end_date),
      granularity,
      include_services === "true"
    );

    res.json({
      success: true,
      message: "Revenue analytics retrieved successfully",
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get revenue analytics",
      error: error.message,
    });
  }
};

/**
 * Get booking analytics
 * @route GET /api/admin/analytics/bookings
 */
const getBookingAnalytics = async (req, res) => {
  try {
    const { start_date, end_date, granularity = "daily" } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const analytics = await Analytics.getBookingAnalytics(
      new Date(start_date),
      new Date(end_date),
      granularity
    );

    res.json({
      success: true,
      message: "Booking analytics retrieved successfully",
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get booking analytics",
      error: error.message,
    });
  }
};

/**
 * Get customer analytics
 * @route GET /api/admin/analytics/customers
 */
const getCustomerAnalytics = async (req, res) => {
  try {
    const { start_date, end_date, segment = "all" } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const analytics = await Analytics.getCustomerAnalytics(
      new Date(start_date),
      new Date(end_date),
      segment
    );

    res.json({
      success: true,
      message: "Customer analytics retrieved successfully",
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get customer analytics",
      error: error.message,
    });
  }
};

/**
 * Get performance metrics
 * @route GET /api/admin/analytics/performance
 */
const getPerformanceMetrics = async (req, res) => {
  try {
    const { timeframe = "30d" } = req.query;

    const metrics = await Analytics.getPerformanceMetrics(timeframe);

    res.json({
      success: true,
      message: "Performance metrics retrieved successfully",
      data: metrics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get performance metrics",
      error: error.message,
    });
  }
};

/**
 * Get forecasting data
 * @route GET /api/admin/analytics/forecast
 */
const getForecastData = async (req, res) => {
  try {
    const { type = "occupancy", period = "30d", room_type_id } = req.query;

    const forecast = await Analytics.getForecastData(
      type,
      period,
      room_type_id ? parseInt(room_type_id) : null
    );

    res.json({
      success: true,
      message: "Forecast data retrieved successfully",
      data: forecast,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get forecast data",
      error: error.message,
    });
  }
};

/**
 * Get comparative analytics
 * @route GET /api/admin/analytics/compare
 */
const getComparativeAnalytics = async (req, res) => {
  try {
    const {
      current_start,
      current_end,
      previous_start,
      previous_end,
      metrics = "revenue,occupancy,bookings",
    } = req.query;

    if (!current_start || !current_end || !previous_start || !previous_end) {
      return res.status(400).json({
        success: false,
        message: "All date parameters are required for comparison",
      });
    }

    const comparison = await Analytics.getComparativeAnalytics(
      new Date(current_start),
      new Date(current_end),
      new Date(previous_start),
      new Date(previous_end),
      metrics.split(",")
    );

    res.json({
      success: true,
      message: "Comparative analytics retrieved successfully",
      data: comparison,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get comparative analytics",
      error: error.message,
    });
  }
};

/**
 * Export analytics data
 * @route GET /api/admin/analytics/export
 */
const exportAnalytics = async (req, res) => {
  try {
    const {
      type = "dashboard",
      format = "json",
      start_date,
      end_date,
    } = req.query;

    const data = await Analytics.exportData(
      type,
      start_date ? new Date(start_date) : null,
      end_date ? new Date(end_date) : null
    );

    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="analytics_${type}_${Date.now()}.csv"`
      );

      const csv = await Analytics.convertToCSV(data, type);
      res.send(csv);
    } else {
      res.json({
        success: true,
        message: "Analytics data exported successfully",
        data,
        export_timestamp: new Date().toISOString(),
        export_type: type,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to export analytics data",
      error: error.message,
    });
  }
};

/**
 * Get real-time metrics
 * @route GET /api/admin/analytics/realtime
 */
const getRealTimeMetrics = async (req, res) => {
  try {
    const metrics = await Analytics.getRealTimeMetrics();

    res.json({
      success: true,
      message: "Real-time metrics retrieved successfully",
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get real-time metrics",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardAnalytics,
  getOccupancyAnalytics,
  getRevenueAnalytics,
  getBookingAnalytics,
  getCustomerAnalytics,
  getPerformanceMetrics,
  getForecastData,
  getComparativeAnalytics,
  exportAnalytics,
  getRealTimeMetrics,
};
