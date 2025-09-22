// Application configuration
export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
    timeout: 10000,
    retryAttempts: 3,
  },

  // Authentication Configuration
  auth: {
    tokenKey: "homestay_auth_token",
    userKey: "homestay_user_data",
    rememberMeKey: "homestay_remember_me",
    tokenExpiryBuffer: 300, // 5 minutes before actual expiry
  },

  // Validation Rules
  validation: {
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Email không hợp lệ",
    },
    phone: {
      pattern: /^[0-9]{10,11}$/,
      message: "Số điện thoại phải có 10-11 chữ số",
    },
    password: {
      minLength: 6,
      message: "Mật khẩu phải có ít nhất 6 ký tự",
    },
    fullName: {
      minLength: 2,
      maxLength: 50,
      message: "Họ tên phải từ 2-50 ký tự",
    },
  },

  // UI Configuration
  ui: {
    toastDuration: 5000,
    loadingDelay: 300,
    animationDuration: 300,
  },

  // App Metadata
  app: {
    name: "Homestay Management System",
    shortName: "Homestay",
    version: "1.0.0",
    description: "Hệ thống quản lý homestay hiện đại và dễ sử dụng",
  },

  // Environment flags
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  enableDevTools: import.meta.env.VITE_ENABLE_DEV_TOOLS === "true",
};

export default config;
