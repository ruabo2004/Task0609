// Controllers Index
// Export all controllers for easy importing

const authController = require("./authController");
const userController = require("./userController");
const roomController = require("./roomController");
const bookingController = require("./bookingController");
const paymentController = require("./paymentController");
const serviceController = require("./serviceController");
const reviewController = require("./reviewController");
const reportController = require("./reportController");
const contactController = require("./contactController");

// Employee Module Controllers
const staffProfileController = require("./staffProfileController");
const workShiftController = require("./workShiftController");
const staffTaskController = require("./staffTaskController");
const attendanceController = require("./attendanceController");

// Admin Module Controllers
const admin = require("./admin");

module.exports = {
  authController,
  userController,
  roomController,
  bookingController,
  paymentController,
  serviceController,
  reviewController,
  reportController,
  contactController,
  // Employee Module
  staffProfileController,
  workShiftController,
  staffTaskController,
  attendanceController,
  // Admin Module
  admin,
};
