import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import authService from "@services/authService";
import { showToast } from "@components/Common/Toast";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@utils/constants";

/**
 * Authentication Context
 * Manages global authentication state and provides auth methods
 */

// Initial auth state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  error: null,
};

// Auth action types
const AUTH_ACTIONS = {
  INITIALIZE: "INITIALIZE",
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  UPDATE_PROFILE: "UPDATE_PROFILE",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_LOADING: "SET_LOADING",
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.INITIALIZE:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!(action.payload.user && action.payload.token),
        isLoading: false,
        isInitialized: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: action.payload.user,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload.loading,
      };

    default:
      return state;
  }
};

// Create contexts
const AuthContext = createContext();
const AuthDispatchContext = createContext();

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

/**
 * Custom hook to use auth dispatch
 */
export const useAuthDispatch = () => {
  const context = useContext(AuthDispatchContext);
  if (!context) {
    throw new Error("useAuthDispatch must be used within AuthProvider");
  }
  return context;
};

/**
 * AuthProvider Component
 */
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication on mount
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Check if user is already authenticated
        if (authService.isAuthenticated() && !authService.isTokenExpired()) {
          const user = authService.getCurrentUser();
          const token = authService.getToken();

          if (isMounted) {
            dispatch({
              type: AUTH_ACTIONS.INITIALIZE,
              payload: { user, token },
            });
          }

          // Optionally refresh user profile from server
          try {
            const refreshedUser = await authService.getProfile();
            if (isMounted) {
              dispatch({
                type: AUTH_ACTIONS.UPDATE_PROFILE,
                payload: { user: refreshedUser },
              });
            }
          } catch (refreshError) {
            // If refresh fails, keep existing user data
            console.warn("Failed to refresh user profile:", refreshError);
          }
        } else {
          // Not authenticated or token expired
          if (isMounted) {
            dispatch({
              type: AUTH_ACTIONS.INITIALIZE,
              payload: { user: null, token: null },
            });
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (isMounted) {
          dispatch({
            type: AUTH_ACTIONS.INITIALIZE,
            payload: { user: null, token: null },
          });
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auth methods
  const login = useCallback(async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const { customer, token } = await authService.login(credentials);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: customer, token },
      });

      showToast.success(SUCCESS_MESSAGES.LOGIN_SUCCESS);
      return { success: true, user: customer };
    } catch (error) {
      const errorMessage = error.message || ERROR_MESSAGES.INVALID_CREDENTIALS;

      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorMessage },
      });

      showToast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const { customer, token } = await authService.register(userData);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: customer, token },
      });

      showToast.success(SUCCESS_MESSAGES.REGISTER_SUCCESS);
      return { success: true, user: customer };
    } catch (error) {
      const errorMessage = error.message || ERROR_MESSAGES.VALIDATION_ERROR;

      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorMessage },
      });

      showToast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      showToast.success(SUCCESS_MESSAGES.LOGOUT_SUCCESS);

      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if API call fails
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: { loading: true } });

    try {
      const updatedUser = await authService.updateProfile(profileData);

      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: { user: updatedUser },
      });

      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: { loading: false } });
      showToast.success(SUCCESS_MESSAGES.PROFILE_UPDATED);
      return { success: true, user: updatedUser };
    } catch (error) {
      const errorMessage = error.message || ERROR_MESSAGES.VALIDATION_ERROR;

      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: { loading: false } });
      showToast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const changePassword = useCallback(async (passwordData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: { loading: true } });

    try {
      await authService.changePassword(passwordData);

      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: { loading: false } });
      showToast.success(SUCCESS_MESSAGES.PASSWORD_CHANGED);
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || ERROR_MESSAGES.VALIDATION_ERROR;

      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: { loading: false } });
      showToast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const uploadProfileImage = useCallback(
    async (imageFile, onProgress = null) => {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: { loading: true } });

      try {
        const updatedUser = await authService.uploadProfileImage(
          imageFile,
          onProgress
        );

        dispatch({
          type: AUTH_ACTIONS.UPDATE_PROFILE,
          payload: { user: updatedUser },
        });

        dispatch({
          type: AUTH_ACTIONS.SET_LOADING,
          payload: { loading: false },
        });
        showToast.success("Cập nhật ảnh đại diện thành công!");
        return { success: true, user: updatedUser };
      } catch (error) {
        const errorMessage = error.message || "Tải ảnh thất bại";

        dispatch({
          type: AUTH_ACTIONS.SET_LOADING,
          payload: { loading: false },
        });
        showToast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const user = await authService.getProfile();
      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: { user },
      });
      return user;
    } catch (error) {
      console.error("Failed to refresh profile:", error);
      throw error;
    }
  }, []);

  // Context value
  const contextValue = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    error: state.error,

    // Methods
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    uploadProfileImage,
    clearError,
    refreshProfile,

    // Utility methods
    isLoggedIn: state.isAuthenticated,
    hasRole: (role) => state.user?.role === role,
    isAdmin: () => state.user?.role === "admin",
    isStaff: () => state.user?.role === "staff",
    isCustomer: () => state.user?.role === "customer",
    getUserId: () => state.user?.customer_id,
    getUserEmail: () => state.user?.email,
    getUserName: () => state.user?.full_name,
    getUserRole: () => state.user?.role,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthContext.Provider>
  );
};

export default AuthContext;
