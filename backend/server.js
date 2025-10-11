const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

// Import database
const { testConnection } = require("./config/database");

// Import routes
const apiRoutes = require("./routes");

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration (must be before other middleware)
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000",
    process.env.CORS_ORIGIN,
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Origin",
    "X-Requested-With",
    "Accept",
  ],
};
app.use(cors(corsOptions));

// Security middleware with relaxed CSP for development
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disable CSP for development to allow images
  })
);

// Rate limiting (more lenient for development)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // increase to 1000 requests per windowMs for development
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Homestay API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api", apiRoutes);

// Static files (for uploaded images)
app.use("/uploads", express.static("uploads"));

// API documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "Homestay Management API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      rooms: "/api/rooms",
      bookings: "/api/bookings",
      payments: "/api/payments",
      services: "/api/services",
      reports: "/api/reports",
    },
    documentation: "See README.md for detailed API documentation",
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error("❌ Failed to connect to database. Exiting...");
      process.exit(1);
    }

    // Start server
    app.listen(PORT, () => {

    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", () => {

  process.exit(0);
});

process.on("SIGINT", () => {

  process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;
