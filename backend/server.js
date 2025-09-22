const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const config = require("./config/config");
const { testConnection } = require("./config/database");

const customerRoutes = require("./routes/customerRoutes");
const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const enhancedPaymentRoutes = require("./routes/enhancedPaymentRoutes");
const preferenceRoutes = require("./routes/preferenceRoutes");
const searchRoutes = require("./routes/searchRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const staffRoutes = require("./routes/staffRoutes");
const adminRoutes = require("./routes/adminRoutes");
const imageRoutes = require("./routes/imageRoutes");

const app = express();

// Serve static files from public directory
app.use("/static", express.static("public"));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: config.security.rateLimitWindow * 60 * 1000,
  max: config.security.rateLimitMaxRequests,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use(limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Homestay Management System API is running",
    timestamp: new Date().toISOString(),
    environment: config.server.env,
  });
});

app.use("/api/customers", customerRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/payments", enhancedPaymentRoutes);
app.use("/api/preferences", preferenceRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/services", require("./routes/additionalServiceRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/pricing", require("./routes/seasonalPricingRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/staff", staffRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/images", imageRoutes);

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

app.use((error, req, res, next) => {
  console.error("Global Error Handler:", error);

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: error.message,
    });
  }

  if (error.name === "UnauthorizedError") {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      success: false,
      message: "Duplicate entry - resource already exists",
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error:
      config.server.env === "development"
        ? error.message
        : "Something went wrong",
  });
});

const startServer = async () => {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error("❌ Failed to connect to database. Server will not start.");
      process.exit(1);
    }

    const PORT = config.server.port;
    app.listen(PORT, () => {
      console.log(
        `🚀 Homestay Management System API Server running on port ${PORT}`
      );
      console.log(`📍 Environment: ${config.server.env}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`💊 Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully...");
  process.exit(0);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

startServer();
