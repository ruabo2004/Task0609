// Models Index
// Export all models for easy importing

const User = require("./User");
const Room = require("./Room");
const Booking = require("./Booking");
const Payment = require("./Payment");
const Service = require("./Service");
const BookingService = require("./BookingService");
const Review = require("./Review");
const StaffReport = require("./StaffReport");

// Employee Module Models
const StaffProfile = require("./StaffProfile");
const WorkShift = require("./WorkShift");
const StaffTask = require("./StaffTask");
const AttendanceLog = require("./AttendanceLog");

module.exports = {
  User,
  Room,
  Booking,
  Payment,
  Service,
  BookingService,
  Review,
  StaffReport,
  // Employee Module
  StaffProfile,
  WorkShift,
  StaffTask,
  AttendanceLog,
};
