import { createContext, useContext, useReducer, useEffect } from 'react';
import { apiService, setAuthToken } from '@/services/api';
import { getDashboardPath } from '@/utils/navigation';

// Create Auth Context
const AuthContext = createContext();

// Export AuthContext for direct usage if needed
export { AuthContext };

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        loading: false,
        user: null,
        token: null,
        isAuthenticated: false,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        loading: false,
        user: null,
        token: null,
        isAuthenticated: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token and validate with server
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('homestay_token');
      const userData = localStorage.getItem('homestay_user');
      
      if (token) {
        // First, try to use cached user data to avoid immediate logout
        if (userData) {
          try {
            const user = JSON.parse(userData);
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, token },
            });
          } catch (parseError) {
            console.error('Failed to parse cached user data:', parseError);
          }
        }
        
        try {
          // Set token for API calls
          setAuthToken(token);
          
          // Validate token with server (silently)
          const response = await apiService.auth.getCurrentUser();
          const user = response.data.data.user;
          
          // Update localStorage with fresh user data
          localStorage.setItem('homestay_user', JSON.stringify(user));
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token },
          });
        } catch (error) {
          // Silently handle token validation errors (don't log to console)
          // Only clear token if it's definitely invalid (401, 403)
          if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('homestay_token');
            localStorage.removeItem('homestay_refresh_token');
            localStorage.removeItem('homestay_user');
            setAuthToken(null);
            dispatch({ type: 'LOGOUT' });
          }
          // For other errors (network, 500, etc.), keep the user logged in
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    dispatch({ type: 'LOADING' });
    
    try {
      const response = await apiService.auth.login({ email, password });
      const { user, accessToken: token, refreshToken } = response.data.data;
      
      // Store in localStorage
      localStorage.setItem('homestay_token', token);
      localStorage.setItem('homestay_refresh_token', refreshToken);
      localStorage.setItem('homestay_user', JSON.stringify(user));
      
      // Set token for future API calls
      setAuthToken(token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
      
      return { user, token };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Login failed. Please try again.';
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage,
      });
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API if user is authenticated
      if (state.token) {
        await apiService.auth.logout();
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local data regardless of API call result
      localStorage.removeItem('homestay_token');
      localStorage.removeItem('homestay_refresh_token');
      localStorage.removeItem('homestay_user');
      setAuthToken(null);
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: 'LOADING' });
    
    try {
      const response = await apiService.auth.register(userData);
      const { user, accessToken: token, refreshToken } = response.data.data;
      
      // Store in localStorage
      localStorage.setItem('homestay_token', token);
      localStorage.setItem('homestay_refresh_token', refreshToken);
      localStorage.setItem('homestay_user', JSON.stringify(user));
      
      // Set token for future API calls
      setAuthToken(token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
      
      return { user, token };
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        // Show validation errors
        const validationErrors = error.response.data.errors.map(err => err.msg).join(', ');
        errorMessage = `Validation failed: ${validationErrors}`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      }
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage,
      });
      throw new Error(errorMessage);
    }
  };

  // Update user function
  const updateUser = (updatedUser) => {
    localStorage.setItem('homestay_user', JSON.stringify(updatedUser));
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { user: updatedUser, token: state.token },
    });
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      await apiService.auth.forgotPassword(email);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to send reset email.';
      throw new Error(errorMessage);
    }
  };

  // Reset password function
  const resetPassword = async (token, password) => {
    try {
      await apiService.auth.resetPassword(token, password);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to reset password.';
      throw new Error(errorMessage);
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await apiService.auth.changePassword({
        currentPassword,
        newPassword,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to change password.';
      throw new Error(errorMessage);
    }
  };

  // Check if user has specific role
  const hasRole = (roles) => {
    if (!state.user) return false;
    if (typeof roles === 'string') return state.user.role === roles;
    if (Array.isArray(roles)) return roles.includes(state.user.role);
    return false;
  };

  // Check if user can access specific route
  const canAccess = (requiredRoles) => {
    if (!state.user) return false;
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return hasRole(requiredRoles);
  };

  // Get user dashboard path
  const getDashboard = () => {
    if (!state.user) return '/';
    return getDashboardPath(state.user.role);
  };

  // Refresh user data from server
  const refreshUser = async () => {
    try {
      const response = await apiService.auth.getCurrentUser();
      const user = response.data.data.user;
      updateUser(user);
      return user;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  };

  // Refresh access token using refresh token
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('homestay_refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiService.auth.refreshToken(refreshToken);
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      
      // Update tokens in localStorage
      localStorage.setItem('homestay_token', accessToken);
      localStorage.setItem('homestay_refresh_token', newRefreshToken);
      
      // Update token for API calls
      setAuthToken(accessToken);
      
      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      // Clear all auth data if refresh fails
      localStorage.removeItem('homestay_token');
      localStorage.removeItem('homestay_refresh_token');
      localStorage.removeItem('homestay_user');
      setAuthToken(null);
      dispatch({ type: 'LOGOUT' });
      throw error;
    }
  };

  const value = {
    ...state,
    login,
    logout,
    register,
    updateUser,
    forgotPassword,
    resetPassword,
    changePassword,
    hasRole,
    canAccess,
    getDashboard,
    refreshUser,
    refreshAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
