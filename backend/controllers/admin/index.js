// Admin Controllers Index
// Central export point for all admin controllers

const dashboardController = require("./dashboardController");
const roomController = require("./roomController");
const serviceController = require("./serviceController");
const customerController = require("./customerController");
const bookingController = require("./bookingController");

module.exports = {
  dashboardController,
  roomController,
  serviceController,
  customerController,
  bookingController,
};
