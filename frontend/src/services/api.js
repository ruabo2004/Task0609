import axios from "axios";
import config from "@config/config";
import { getStorageItem, removeStorageItem } from "@utils/storage";
import { STORAGE_KEYS, ERROR_MESSAGES } from "@utils/constants";
import { extractErrorMessage } from "@utils/helpers";

// Create axios instance
const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getStorageItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 401:
          // Token expired or invalid - redirect to login
          removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
          removeStorageItem(STORAGE_KEYS.USER_DATA);
          window.location.href = "/login";
          break;

        case 403:
          // Forbidden - user doesn't have permission
          error.message = ERROR_MESSAGES.UNAUTHORIZED;
          break;

        case 404:
          // Not found
          error.message = "Tài nguyên không tồn tại";
          break;

        case 422:
          // Validation error
          error.message = extractErrorMessage(error);
          break;

        case 500:
          // Server error
          error.message = ERROR_MESSAGES.SERVER_ERROR;
          break;

        default:
          error.message = extractErrorMessage(error);
      }
    } else if (error.request) {
      // Network error
      error.message = ERROR_MESSAGES.NETWORK_ERROR;
    } else {
      // Other error
      error.message = error.message || "Đã xảy ra lỗi không xác định";
    }

    return Promise.reject(error);
  }
);

// API helper functions
export const apiHelpers = {
  /**
   * GET request
   * @param {string} url
   * @param {object} config
   * @returns {Promise}
   */
  get: (url, config = {}) => api.get(url, config),

  /**
   * POST request
   * @param {string} url
   * @param {object} data
   * @param {object} config
   * @returns {Promise}
   */
  post: (url, data = {}, config = {}) => api.post(url, data, config),

  /**
   * PUT request
   * @param {string} url
   * @param {object} data
   * @param {object} config
   * @returns {Promise}
   */
  put: (url, data = {}, config = {}) => api.put(url, data, config),

  /**
   * DELETE request
   * @param {string} url
   * @param {object} config
   * @returns {Promise}
   */
  delete: (url, config = {}) => api.delete(url, config),

  /**
   * Upload file
   * @param {string} url
   * @param {FormData} formData
   * @param {Function} onUploadProgress
   * @returns {Promise}
   */
  upload: (url, formData, onUploadProgress = null) => {
    return api.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
  },
};

export default api;
