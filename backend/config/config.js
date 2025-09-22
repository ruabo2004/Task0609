require("dotenv").config();

module.exports = {
  database: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Viettit2004@",
    database: process.env.DB_NAME || "task0609",
    port: process.env.DB_PORT || 3306,
  },

  jwt: {
    secret:
      process.env.JWT_SECRET ||
      "your-super-secret-jwt-key-task0609-homestay-2024",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  },

  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || "development",
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  },

  momo: {
    partnerCode: process.env.MOMO_PARTNER_CODE || "MOMOBKUN20180529",
    accessKey: process.env.MOMO_ACCESS_KEY || "klm05TvNBzhg7h7j",
    secretKey:
      process.env.MOMO_SECRET_KEY || "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa",
    endpoint:
      process.env.MOMO_ENDPOINT ||
      "https://test-payment.momo.vn/v2/gateway/api/create",
    redirectUrl:
      process.env.MOMO_REDIRECT_URL ||
      "http://localhost:3000/payment/momo/callback",
    ipnUrl:
      process.env.MOMO_IPN_URL || "http://localhost:5000/api/payment/momo/ipn",
    requestType: "payWithATM",
    extraData: "",
  },

  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER || "vietze.com@gmail.com",
    password: process.env.EMAIL_PASSWORD || "kfdzlibehgvenlaf",
    from: process.env.EMAIL_FROM || "noreply@homestay.com",
  },

  upload: {
    path: process.env.UPLOAD_PATH || "uploads/",
    maxFileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024,
    allowedTypes: process.env.ALLOWED_FILE_TYPES
      ? process.env.ALLOWED_FILE_TYPES.split(",")
      : ["image/jpeg", "image/png", "image/gif", "image/webp"],
  },

  security: {
    rateLimitWindow: process.env.RATE_LIMIT_WINDOW || 15,
    rateLimitMaxRequests: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
    bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS || 10,
  },

  logging: {
    level: process.env.LOG_LEVEL || "info",
    file: process.env.LOG_FILE || "logs/app.log",
  },
};
