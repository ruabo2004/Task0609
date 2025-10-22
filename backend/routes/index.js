const express = require("express");
const router = express.Router();

// Import all route modules
const authRoutes = require("./auth");
const userRoutes = require("./users");
const roomRoutes = require("./rooms");
const bookingRoutes = require("./bookings");
const paymentRoutes = require("./payments");
const momoRoutes = require("./momo");
const serviceRoutes = require("./services");
const reviewRoutes = require("./reviews");
const reportRoutes = require("./reports");
const contactRoutes = require("./contacts");

// Admin Module Routes
const adminRoutes = require("./admin");

// API Documentation endpoint
router.get("/", (req, res) => {
  res.json({
    message: "🏠 Homestay Management API",
    version: "1.0.0",
    status: "active",
    endpoints: {
      authentication: "/api/auth",
      users: "/api/users",
      rooms: "/api/rooms",
      bookings: "/api/bookings",
      payments: "/api/payments",
      services: "/api/services",
      reviews: "/api/reviews",
      reports: "/api/reports",
      contacts: "/api/contacts",
      // Admin Module
      admin_dashboard: "/api/admin/dashboard",
      admin_rooms: "/api/admin/rooms",
      admin_services: "/api/admin/services",
      admin_bookings: "/api/admin/bookings",
    },
    documentation: {
      swagger: "/api/docs",
      postman: "/api/postman",
    },
    support: {
      email: "support@homestay.com",
      github: "https://github.com/homestay/api",
    },
  });
});

// Mount route modules
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/rooms", roomRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);
router.use("/payments/momo", momoRoutes);
router.use("/services", serviceRoutes);
router.use("/reviews", reviewRoutes);
router.use("/reports", reportRoutes);
router.use("/contacts", contactRoutes);

// Admin Module Routes
router.use("/admin", adminRoutes);

module.exports = router;
