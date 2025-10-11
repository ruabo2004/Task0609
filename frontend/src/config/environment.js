/**
 * Environment configuration
 * Centralized access to environment variables with defaults
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  UPLOAD_BASE_URL: import.meta.env.VITE_UPLOAD_BASE_URL || 'http://localhost:5000/uploads',
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3,
};

// App Configuration
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'Homestay Management',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
};

// Feature Flags
export const FEATURES = {
  ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false', // Default true
  DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true' || import.meta.env.MODE === 'development',
};

// Development helpers
export const isDevelopment = () => import.meta.env.MODE === 'development';
export const isProduction = () => import.meta.env.MODE === 'production';
export const isTest = () => import.meta.env.MODE === 'test';

// URL helpers
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_CONFIG.UPLOAD_BASE_URL}/${path}`;
};

export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'homestay_token',
  USER_DATA: 'homestay_user',
  PREFERENCES: 'homestay_preferences',
  CART: 'homestay_cart',
  SEARCH_HISTORY: 'homestay_search_history',
};

// Default configurations
export const DEFAULTS = {
  PAGINATION: {
    PAGE: 1,
    LIMIT: 10,
    MAX_LIMIT: 100,
  },
  TIMEOUTS: {
    DEBOUNCE: 300,
    TOAST: 4000,
    RETRY: 1000,
  },
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
};

// Validation
const validateEnvironment = () => {
  const required = [
    'VITE_API_BASE_URL',
  ];
  
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0 && isProduction()) {
    console.error('Missing required environment variables:', missing);
  }
  
  if (isDevelopment()) {
    console.log('Environment Configuration:', {
      API_CONFIG,
      APP_CONFIG,
      FEATURES,
    });
  }
};

// Initialize
validateEnvironment();

export default {
  API_CONFIG,
  APP_CONFIG,
  FEATURES,
  STORAGE_KEYS,
  DEFAULTS,
  isDevelopment,
  isProduction,
  isTest,
  getImageUrl,
  getApiUrl,
};
