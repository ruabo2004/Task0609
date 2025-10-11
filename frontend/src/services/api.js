import axios from 'axios';
import toast from 'react-hot-toast';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('homestay_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { response, config } = error;
    
    if (response) {
      switch (response.status) {
        case 401:
          // Silently handle 401 on /auth/me during initialization
          const isAuthMeRequest = config.url === '/auth/me';
          
          // Try to refresh token if this is not a refresh request
          if (config.url !== '/auth/refresh' && config.url !== '/auth/login' && config.url !== '/auth/register') {
            const refreshToken = localStorage.getItem('homestay_refresh_token');
            if (refreshToken) {
              try {
                const refreshResponse = await api.post('/auth/refresh', { refreshToken });
                const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
                
                // Update tokens
                localStorage.setItem('homestay_token', accessToken);
                localStorage.setItem('homestay_refresh_token', newRefreshToken);
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                
                // Retry original request
                config.headers.Authorization = `Bearer ${accessToken}`;
                return api(config);
              } catch (refreshError) {
                // Refresh failed, clear auth data and redirect to login (only if not on auth pages)
                localStorage.removeItem('homestay_token');
                localStorage.removeItem('homestay_refresh_token');
                localStorage.removeItem('homestay_user');
                if (!window.location.pathname.startsWith('/auth') && !isAuthMeRequest) {
                  window.location.href = '/auth/login';
                  toast.error('Session expired. Please login again.');
                }
              }
            } else {
              // No refresh token, clear auth data (silently for /auth/me)
              localStorage.removeItem('homestay_token');
              localStorage.removeItem('homestay_refresh_token');
              localStorage.removeItem('homestay_user');
              if (!window.location.pathname.startsWith('/auth') && !isAuthMeRequest) {
                window.location.href = '/auth/login';
                toast.error('Session expired. Please login again.');
              }
            }
          }
          break;
        case 403:
          // Don't show toast here - let the calling code handle it
          break;
        case 404:
          // Don't show toast here - let the calling code handle it
          break;
        case 422:
          // Don't show toast here - let the calling code handle it
          break;
        case 429:
          // Show toast for rate limiting (global concern)
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
          // Show toast for server errors (global concern)
          toast.error('Server error. Please try again later.');
          break;
        default:
          // Don't show toast here - let the calling code handle it
          break;
      }
    } else if (error.code === 'ECONNABORTED') {
      // Show toast for timeout (global concern)
      toast.error('Request timeout. Please check your connection.');
    } else if (error.message === 'Network Error') {
      // Show toast for network errors (global concern)
      toast.error('Network error. Please check your internet connection.');
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Generic methods
  get: (url, config = {}) => api.get(url, config),
  post: (url, data, config = {}) => api.post(url, data, config),
  put: (url, data, config = {}) => api.put(url, data, config),
  patch: (url, data, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),

  // Authentication endpoints
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
    getCurrentUser: () => api.get('/auth/me'),
    changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  },

  // User endpoints
  users: {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (userData) => api.put('/users/profile', userData),
    uploadAvatar: (formData) => api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getAll: (params = {}) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    create: (userData) => api.post('/users', userData),
    update: (id, userData) => api.put(`/users/${id}`, userData),
    delete: (id) => api.delete(`/users/${id}`),
    getStats: () => api.get('/users/stats'),
    search: (params = {}) => api.get('/users/search', { params }),
  },

  // Room endpoints
  rooms: {
    getAll: (params = {}) => api.get('/rooms', { params }),
    getById: (id) => api.get(`/rooms/${id}`),
    getAvailable: (params = {}) => api.get('/rooms/available', { params }),
    getBookedDates: (id, params = {}) => api.get(`/rooms/${id}/booked-dates`, { params }),
    getReviews: (id, params = {}) => api.get(`/rooms/${id}/reviews`, { params }),
    create: (roomData) => api.post('/rooms', roomData),
    update: (id, roomData) => api.put(`/rooms/${id}`, roomData),
    delete: (id) => api.delete(`/rooms/${id}`),
    uploadImages: (id, formData) => api.post(`/rooms/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    updateStatus: (id, status) => api.patch(`/rooms/${id}/status`, { status }),
    getStats: () => api.get('/rooms/stats'),
    getTypes: () => api.get('/rooms/types'),
  },

  // Review endpoints
  reviews: {
    getAll: (params = {}) => api.get('/reviews', { params }),
    getById: (id) => api.get(`/reviews/${id}`),
    create: (reviewData) => api.post('/reviews', reviewData),
    update: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
    delete: (id) => api.delete(`/reviews/${id}`),
  },

  // Booking endpoints
  bookings: {
    getAll: (params = {}) => api.get('/bookings', { params }),
    getById: (id) => api.get(`/bookings/${id}`),
    getUserBookings: (params = {}) => api.get('/bookings/my-bookings', { params }),
    getUserStats: () => api.get('/bookings/user/stats'),
    checkAvailability: (availabilityData) => api.post('/bookings/check-availability', availabilityData),
    create: (bookingData) => api.post('/bookings', bookingData),
    update: (id, bookingData) => api.put(`/bookings/${id}`, bookingData),
    cancel: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
    confirm: (id) => api.put(`/bookings/${id}/confirm`),
    checkIn: (id) => api.put(`/bookings/${id}/checkin`),
    checkOut: (id, data = {}) => api.put(`/bookings/${id}/checkout`, data),
    addService: (id, serviceData) => api.post(`/bookings/${id}/services`, serviceData),
    getServices: (id) => api.get(`/bookings/${id}/services`),
    removeService: (bookingId, bookingServiceId) => api.delete(`/bookings/${bookingId}/services/${bookingServiceId}`),
    getStats: () => api.get('/bookings/stats'),
  },

  // Payment endpoints
  payments: {
    getAll: (params = {}) => api.get('/payments', { params }),
    getById: (id) => api.get(`/payments/${id}`),
    getUserPayments: (params = {}) => api.get('/payments/user', { params }),
    create: (paymentData) => api.post('/payments', paymentData),
    updateStatus: (id, status) => api.patch(`/payments/${id}/status`, { status }),
    update: (id, data) => api.put(`/payments/${id}`, data),
    processRefund: (id, refundData) => api.post(`/payments/${id}/refund`, refundData),
    getStats: () => api.get('/payments/stats'),
    getRevenue: (params = {}) => api.get('/payments/revenue', { params }),
    // MoMo payment
    createMomoPayment: (paymentData) => api.post('/payments/momo/create', paymentData),
    checkMomoStatus: (orderId) => api.get(`/payments/momo/status/${orderId}`),
  },

  // Service endpoints
  services: {
    getAll: (params = {}) => api.get('/services', { params }),
    getActive: () => api.get('/services/active'),
    getById: (id) => api.get(`/services/${id}`),
    getByCategory: (category) => api.get(`/services/category/${category}`),
    create: (serviceData) => api.post('/services', serviceData),
    update: (id, serviceData) => api.put(`/services/${id}`, serviceData),
    delete: (id) => api.delete(`/services/${id}`),
    toggleActive: (id) => api.patch(`/services/${id}/toggle-active`),
    getCategories: () => api.get('/services/categories'),
    getStats: () => api.get('/services/stats'),
  },

  // Review endpoints
  reviews: {
    getAll: (params = {}) => api.get('/reviews', { params }),
    getById: (id) => api.get(`/reviews/${id}`),
    getByRoom: (roomId, params = {}) => api.get(`/reviews/room/${roomId}`, { params }),
    getByUser: (userId, params = {}) => api.get(`/reviews/user/${userId}`, { params }),
    getUserReviews: (params = {}) => api.get('/reviews/my-reviews', { params }),
    getRandomTestimonials: (count = 3) => api.get(`/reviews/testimonials?count=${count}`),
    create: (reviewData) => api.post('/reviews', reviewData),
    update: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
    delete: (id) => api.delete(`/reviews/${id}`),
    getStats: () => api.get('/reviews/stats'),
  },

  // Report endpoints
  reports: {
    getAll: (params = {}) => api.get('/reports', { params }),
    getById: (id) => api.get(`/reports/${id}`),
    getUserReports: (params = {}) => api.get('/reports/my-reports', { params }),
    create: (reportData) => api.post('/reports', reportData),
    update: (id, reportData) => api.put(`/reports/${id}`, reportData),
    getDashboard: () => api.get('/reports/dashboard'),
    getBusinessAnalytics: (params = {}) => api.get('/reports/business-analytics', { params }),
    getBookingAnalytics: (params = {}) => api.get('/reports/booking-analytics', { params }),
    getRevenueReport: (params = {}) => api.get('/reports/revenue', { params }),
    getOverview: (params = {}) => api.get('/reports/overview', { params }),
  },

  // Note: Staff Profiles, Work Shifts, Tasks, and Attendance modules removed per requirements cleanup

  // Admin endpoints (simplified per yêu cầu.txt)
  admin: {
    // Dashboard
    dashboard: {
      getOverview: () => api.get('/admin/dashboard/overview'),
      getRevenue: (params = {}) => api.get('/admin/dashboard/revenue', { params }),
      getTopRooms: (params = {}) => api.get('/admin/dashboard/top-rooms', { params }),
    },
    
    // Room Management (basic CRUD only)
    rooms: {
      getAll: (params = {}) => api.get('/admin/rooms', { params }),
      getById: (id) => api.get(`/admin/rooms/${id}`),
      create: (roomData) => api.post('/admin/rooms', roomData),
      update: (id, roomData) => api.put(`/admin/rooms/${id}`, roomData),
      delete: (id) => api.delete(`/admin/rooms/${id}`),
    },
    
    // Service Management (basic CRUD only)
    services: {
      getAll: (params = {}) => api.get('/admin/services', { params }),
      getById: (id) => api.get(`/admin/services/${id}`),
      create: (serviceData) => api.post('/admin/services', serviceData),
      update: (id, serviceData) => api.put(`/admin/services/${id}`, serviceData),
      delete: (id) => api.delete(`/admin/services/${id}`),
    },
    
    // Booking Management (confirm/check-in/cancel only)
    bookings: {
      getAll: (params = {}) => api.get('/admin/bookings', { params }),
      getById: (id) => api.get(`/admin/bookings/${id}`),
      confirm: (id) => api.patch(`/admin/bookings/${id}/confirm`),
      checkIn: (id) => api.patch(`/admin/bookings/${id}/check-in`),
      cancel: (id) => api.patch(`/admin/bookings/${id}/cancel`),
    },

    // User Management (using existing /api/users endpoints)
    users: {
      getAll: (params = {}) => api.get('/users', { params }),
      getById: (id) => api.get(`/users/${id}`),
      create: (userData) => api.post('/users', userData),
      update: (id, userData) => api.put(`/users/${id}`, userData),
      delete: (id) => api.delete(`/users/${id}`),
      getStats: () => api.get('/users/stats'),
      search: (params = {}) => api.get('/users/search', { params }),
    },

    // Staff Management (alias for users with staff role)
    staff: {
      getAll: (params = {}) => api.get('/users', { params: { ...params, role: 'staff' } }),
      getById: (id) => api.get(`/users/${id}`),
      create: (staffData) => api.post('/users', { ...staffData, role: 'staff' }),
      update: (id, staffData) => api.put(`/users/${id}`, staffData),
      delete: (id) => api.delete(`/users/${id}`),
    },

    // Customer Management (alias for users with customer role)
    customers: {
      getAll: (params = {}) => api.get('/users', { params: { ...params, role: 'customer' } }),
      getById: (id) => api.get(`/users/${id}`),
      create: (customerData) => api.post('/users', { ...customerData, role: 'customer' }),
      update: (id, customerData) => api.put(`/users/${id}`, customerData),
      delete: (id) => api.delete(`/users/${id}`),
    },
  },
};

// Utility functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('homestay_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('homestay_token');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('homestay_token');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

export default api;
