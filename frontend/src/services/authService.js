import api from "./api";
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
} from "@utils/storage";
import { STORAGE_KEYS, API_ENDPOINTS } from "@utils/constants";

/**
 * Authentication Service
 * Handles all authentication-related API calls and token management
 */
export const authService = {
  /**
   * Register new user
   * @param {object} userData - User registration data
   * @returns {Promise<object>} User data and token
   */
  register: async (userData) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      const { customer, token } = response.data.data;

      // Store token and user data
      setStorageItem(STORAGE_KEYS.AUTH_TOKEN, token);
      setStorageItem(STORAGE_KEYS.USER_DATA, customer);

      return { customer, token };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login user
   * @param {object} credentials - Login credentials
   * @returns {Promise<object>} User data and token
   */
  login: async (credentials) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      const { customer, token } = response.data.data;

      // Store token and user data
      setStorageItem(STORAGE_KEYS.AUTH_TOKEN, token);
      setStorageItem(STORAGE_KEYS.USER_DATA, customer);

      // Handle remember me
      if (credentials.remember_me) {
        setStorageItem(STORAGE_KEYS.REMEMBER_ME, true);
      }

      return { customer, token };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      // Call logout API (optional - for server-side token invalidation)
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Don't throw error on logout API failure
      console.error("Logout API error:", error);
    } finally {
      // Always clear stored data
      removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
      removeStorageItem(STORAGE_KEYS.USER_DATA);
      removeStorageItem(STORAGE_KEYS.REMEMBER_ME);
    }
  },

  /**
   * Get user profile
   * @returns {Promise<object>} User profile data
   */
  getProfile: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.PROFILE);
      const customer = response.data.data.customer;

      // Update stored user data
      setStorageItem(STORAGE_KEYS.USER_DATA, customer);

      return customer;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {object} profileData - Profile update data
   * @returns {Promise<object>} Updated user data
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put(API_ENDPOINTS.AUTH.PROFILE, profileData);
      const customer = response.data.data.customer;

      // Update stored user data
      setStorageItem(STORAGE_KEYS.USER_DATA, customer);

      return customer;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Change password
   * @param {object} passwordData - Password change data
   * @returns {Promise<object>} Success response
   */
  changePassword: async (passwordData) => {
    try {
      const response = await api.put(
        API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        passwordData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload profile image
   * @param {File} imageFile - Image file to upload
   * @param {Function} onUploadProgress - Upload progress callback
   * @returns {Promise<object>} Upload response
   */
  uploadProfileImage: async (imageFile, onUploadProgress = null) => {
    try {
      const formData = new FormData();
      formData.append("profile_image", imageFile);

      const response = await api.post("/customers/profile/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
      });

      const customer = response.data.data.customer;

      // Update stored user data
      setStorageItem(STORAGE_KEYS.USER_DATA, customer);

      return customer;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verify email
   * @param {string} token - Email verification token
   * @returns {Promise<object>} Verification response
   */
  verifyEmail: async (token) => {
    try {
      const response = await api.post("/customers/verify-email", { token });
      const customer = response.data.data.customer;

      // Update stored user data
      setStorageItem(STORAGE_KEYS.USER_DATA, customer);

      return customer;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<object>} Reset request response
   */
  requestPasswordReset: async (email) => {
    try {
      const response = await api.post("/customers/reset-password", { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset password with token
   * @param {object} resetData - Reset password data
   * @returns {Promise<object>} Reset response
   */
  resetPassword: async (resetData) => {
    try {
      const response = await api.post(
        "/customers/reset-password/confirm",
        resetData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Token and authentication utilities

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated: () => {
    const token = getStorageItem(STORAGE_KEYS.AUTH_TOKEN);
    const user = getStorageItem(STORAGE_KEYS.USER_DATA);
    return !!(token && user);
  },

  /**
   * Get current user from storage
   * @returns {object|null} Current user data
   */
  getCurrentUser: () => {
    return getStorageItem(STORAGE_KEYS.USER_DATA);
  },

  /**
   * Get auth token from storage
   * @returns {string|null} Current auth token
   */
  getToken: () => {
    return getStorageItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Check if token is expired
   * @returns {boolean} Token expiry status
   */
  isTokenExpired: () => {
    const token = getStorageItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return true;

    try {
      // Decode JWT token to check expiry
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;

      return payload.exp < currentTime;
    } catch (error) {
      // If can't decode token, consider it expired
      return true;
    }
  },

  /**
   * Refresh authentication state
   * @returns {Promise<object|null>} Current user or null
   */
  refreshAuth: async () => {
    try {
      if (!authService.isAuthenticated() || authService.isTokenExpired()) {
        return null;
      }

      // Refresh user profile from server
      const user = await authService.getProfile();
      return user;
    } catch (error) {
      // If refresh fails, logout user
      await authService.logout();
      return null;
    }
  },
};

export default authService;
