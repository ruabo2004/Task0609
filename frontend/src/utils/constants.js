// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "homestay_auth_token",
  USER_DATA: "homestay_user_data",
  REMEMBER_ME: "homestay_remember_me",
  THEME: "homestay_theme",
  LANGUAGE: "homestay_language",
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/customers/register",
    LOGIN: "/customers/login",
    LOGOUT: "/customers/logout",
    PROFILE: "/customers/profile",
    CHANGE_PASSWORD: "/customers/change-password",
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    CUSTOMERS: "/admin/customers",
    EMPLOYEES: "/admin/employees",
    ROOMS: "/admin/rooms",
    REPORTS: "/admin/reports",
  },
  STAFF: {
    DASHBOARD: "/staff/dashboard",
    BOOKINGS: "/staff/bookings",
    CHECKIN: "/staff/bookings/:id/checkin",
    CHECKOUT: "/staff/bookings/:id/checkout",
    REPORTS: "/staff/reports",
  },
};

// Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  DASHBOARD: "/dashboard",
  ROOMS: "/rooms",
  ROOM_DETAIL: "/rooms/:roomId",
  SEARCH: "/search",
  BOOKINGS: "/bookings",
  PAYMENTS: "/payments",

  // Booking System routes
  BOOKING: {
    CREATE: "/booking/:roomId",
    CONFIRMATION: "/booking/confirmation",
    HISTORY: "/booking/history",
    DETAILS: "/booking/:bookingId",
    MODIFY: "/booking/:bookingId/modify",
    CANCEL: "/booking/:bookingId/cancel",
  },

  // Payment routes
  PAYMENT: {
    PROCESS: "/payment/:bookingId",
    SUCCESS: "/payment/success",
    CANCEL: "/payment/cancel",
    METHODS: "/payment/methods",
  },

  // Review routes
  REVIEW: {
    CREATE: "/review/:bookingId",
    LIST: "/reviews",
    DETAILS: "/review/:reviewId",
  },

  // Admin routes
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    CUSTOMERS: "/admin/customers",
    EMPLOYEES: "/admin/employees",
    ROOMS: "/admin/rooms",
    BOOKINGS: "/admin/bookings",
    PAYMENTS: "/admin/payments",
    REVIEWS: "/admin/reviews",
    REPORTS: "/admin/reports",
  },

  // Staff routes
  STAFF: {
    DASHBOARD: "/staff/dashboard",
    BOOKINGS: "/staff/bookings",
    CHECKIN: "/staff/checkin",
    CHECKOUT: "/staff/checkout",
    REPORTS: "/staff/reports",
  },
};

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: "Trường này là bắt buộc",
  EMAIL_INVALID: "Email không hợp lệ",
  PHONE_INVALID: "Số điện thoại phải có 10-11 chữ số",
  PASSWORD_MIN_LENGTH: "Mật khẩu phải có ít nhất 6 ký tự",
  PASSWORD_MISMATCH: "Mật khẩu xác nhận không khớp",
  NAME_MIN_LENGTH: "Họ tên phải có ít nhất 2 ký tự",
  NAME_MAX_LENGTH: "Họ tên không được quá 50 ký tự",
  AGE_MINIMUM: "Bạn phải từ 18 tuổi trở lên",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  REGISTER_SUCCESS: "Đăng ký tài khoản thành công!",
  LOGIN_SUCCESS: "Đăng nhập thành công!",
  LOGOUT_SUCCESS: "Đăng xuất thành công!",
  PROFILE_UPDATED: "Cập nhật thông tin thành công!",
  PASSWORD_CHANGED: "Đổi mật khẩu thành công!",
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Lỗi kết nối mạng. Vui lòng thử lại.",
  SERVER_ERROR: "Lỗi máy chủ. Vui lòng thử lại sau.",
  VALIDATION_ERROR: "Dữ liệu không hợp lệ.",
  UNAUTHORIZED: "Bạn không có quyền truy cập.",
  SESSION_EXPIRED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  EMAIL_EXISTS: "Email đã được sử dụng.",
  INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng.",
  ACCOUNT_DEACTIVATED: "Tài khoản đã bị vô hiệu hóa.",
  CURRENT_PASSWORD_INCORRECT: "Mật khẩu hiện tại không đúng.",
  SAME_PASSWORD: "Mật khẩu mới phải khác mật khẩu hiện tại.",
};

// User Roles
export const USER_ROLES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
  STAFF: "staff",
};

// Gender Options
export const GENDER_OPTIONS = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

// Password Strength Levels
export const PASSWORD_STRENGTH = {
  WEAK: "weak",
  MEDIUM: "medium",
  STRONG: "strong",
};

// Theme Options
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

// Language Options
export const LANGUAGES = {
  VI: "vi",
  EN: "en",
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

// Loading States
export const LOADING_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};
