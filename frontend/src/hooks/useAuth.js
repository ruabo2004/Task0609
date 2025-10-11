import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useMutation } from './useApi';
import { apiService } from '@/services/api';

/**
 * Authentication hook with API integration
 * @returns {Object} Auth state and methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

/**
 * Login mutation hook
 * @param {Object} options - Hook options
 * @returns {Object} Login mutation
 */
export const useLogin = (options = {}) => {
  const { login } = useAuth();
  
  return useMutation(
    async (credentials) => {
      const result = await login(credentials.email, credentials.password);
      return result;
    },
    {
      showSuccessToast: true,
      showErrorToast: true,
      ...options,
    }
  );
};

/**
 * Registration mutation hook
 * @param {Object} options - Hook options
 * @returns {Object} Register mutation
 */
export const useRegister = (options = {}) => {
  const { register: registerUser } = useAuth();
  
  return useMutation(
    async (userData) => {
      const result = await registerUser(userData);
      return result;
    },
    {
      showSuccessToast: true,
      showErrorToast: true,
      ...options,
    }
  );
};

/**
 * Password reset request hook
 * @param {Object} options - Hook options
 * @returns {Object} Password reset mutation
 */
export const useForgotPassword = (options = {}) => {
  const { forgotPassword } = useAuth();
  
  return useMutation(
    async (email) => {
      const result = await forgotPassword(email);
      return result;
    },
    {
      showSuccessToast: true,
      showErrorToast: true,
      ...options,
    }
  );
};

/**
 * Password reset hook
 * @param {Object} options - Hook options
 * @returns {Object} Password reset mutation
 */
export const useResetPassword = (options = {}) => {
  const { resetPassword } = useAuth();
  
  return useMutation(
    async ({ token, password }) => {
      const result = await resetPassword(token, password);
      return result;
    },
    {
      showSuccessToast: true,
      showErrorToast: true,
      ...options,
    }
  );
};

/**
 * Password change hook
 * @param {Object} options - Hook options
 * @returns {Object} Change password mutation
 */
export const useChangePassword = (options = {}) => {
  const { changePassword } = useAuth();
  
  return useMutation(
    async ({ currentPassword, newPassword }) => {
      const result = await changePassword(currentPassword, newPassword);
      return result;
    },
    {
      showSuccessToast: true,
      showErrorToast: true,
      ...options,
    }
  );
};

/**
 * Profile update hook
 * @param {Object} options - Hook options
 * @returns {Object} Profile update mutation
 */
export const useUpdateProfile = (options = {}) => {
  const { updateUser, refreshUser } = useAuth();
  
  return useMutation(
    async (profileData) => {

      const response = await apiService.users.updateProfile(profileData);

      const updatedUser = response.data.data.user;

      // Update auth context
      updateUser(updatedUser);
      
      // Also refresh user data to ensure we have the latest from server
      try {
        const freshUser = await refreshUser();

      } catch (refreshError) {

      }
      
      return updatedUser;
    },
    {
      showSuccessToast: false, // We'll handle this in the component
      showErrorToast: true,
      ...options,
    }
  );
};

/**
 * Avatar upload hook
 * @param {Object} options - Hook options
 * @returns {Object} Avatar upload mutation
 */
export const useUploadAvatar = (options = {}) => {
  const { updateUser, user } = useAuth();
  
  return useMutation(
    async (file) => {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await apiService.users.uploadAvatar(formData);
      const updatedUser = response.data.data.user;
      
      // Update auth context
      updateUser(updatedUser);
      
      return updatedUser;
    },
    {
      showSuccessToast: true,
      showErrorToast: true,
      ...options,
    }
  );
};

export default useAuth;
