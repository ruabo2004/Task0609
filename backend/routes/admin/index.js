// Admin Routes
// All routes here require admin authentication

const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../../middleware");

// Import controllers
const dashboardController = require("../../controllers/admin/dashboardController");
const roomController = require("../../controllers/admin/roomController");
const serviceController = require("../../controllers/admin/serviceController");
const adminBookingController = require("../../controllers/admin/bookingController");

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize("admin"));

// ==================== DASHBOARD ROUTES ====================
// @route   GET /api/admin/dashboard/*
// @desc    Dashboard analytics and statistics
// @access  Private/Admin

router.get("/dashboard/overview", dashboardController.getOverview);
router.get("/dashboard/revenue", dashboardController.getRevenueAnalytics);
router.get("/dashboard/occupancy", dashboardController.getOccupancyRate);
router.get("/dashboard/top-rooms", dashboardController.getTopRooms);
router.get("/dashboard/activities", dashboardController.getRecentActivities);

// ==================== ROOM MANAGEMENT ROUTES ====================
// @route   /api/admin/rooms
// @desc    Full CRUD operations for rooms
// @access  Private/Admin

router.get("/rooms", roomController.getAll);
router.get("/rooms/:id", roomController.getById);
router.post("/rooms", roomController.create);
router.put("/rooms/:id", roomController.update);
router.delete("/rooms/:id", roomController.delete);

// ==================== SERVICE MANAGEMENT ROUTES ====================
// @route   /api/admin/services
// @desc    Full CRUD operations for services
// @access  Private/Admin

router.get("/services", serviceController.getAll);
router.get("/services/:id", serviceController.getById);
router.post("/services", serviceController.create);
router.put("/services/:id", serviceController.update);
router.delete("/services/:id", serviceController.delete);

// ==================== BOOKING MANAGEMENT ROUTES ====================
// @route   /api/admin/bookings
// @desc    Booking management from admin perspective (staff can also access)
// @access  Private/Admin/Staff

router.get("/bookings", adminBookingController.getAll);
router.get("/bookings/:id", adminBookingController.getById);
router.patch("/bookings/:id/confirm", adminBookingController.confirmBooking);
router.patch("/bookings/:id/check-in", adminBookingController.checkInBooking);
router.patch("/bookings/:id/cancel", adminBookingController.cancelBooking);

module.exports = router;
