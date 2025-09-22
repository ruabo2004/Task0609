import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import LoadingSpinner from "@components/Common/LoadingSpinner";
import { ROUTES } from "@utils/constants";

/**
 * Protected Route Component
 * Handles authentication-based route protection
 */
const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireRole = null,
  fallback = null,
}) => {
  const { isAuthenticated, isLoading, isInitialized, user } = useAuth();
  const location = useLocation();

  // Show loading while auth is initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Đang tải..." />
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // If authentication is NOT required but user IS authenticated
  if (!requireAuth && isAuthenticated) {
    // Redirect authenticated users away from login/register pages
    const from =
      location.state?.from?.pathname || ROUTES.DASHBOARD || ROUTES.HOME;
    return <Navigate to={from} replace />;
  }

  // If specific role is required
  if (requireRole && user?.role !== requireRole) {
    // Show fallback component or redirect to unauthorized page
    if (fallback) {
      return fallback;
    }

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
          <p className="text-gray-600 mb-6">
            Bạn không có quyền truy cập trang này.
          </p>
          <Navigate to={ROUTES.HOME} replace />
        </div>
      </div>
    );
  }

  // Render children if all checks pass
  return children;
};

/**
 * Public Route Component
 * For routes that should only be accessible to non-authenticated users
 */
export const PublicRoute = ({ children }) => {
  return <ProtectedRoute requireAuth={false}>{children}</ProtectedRoute>;
};

/**
 * Private Route Component
 * For routes that require authentication
 */
export const PrivateRoute = ({
  children,
  requireRole = null,
  fallback = null,
}) => {
  return (
    <ProtectedRoute
      requireAuth={true}
      requireRole={requireRole}
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
};

/**
 * Admin Route Component
 * For routes that require admin role
 */
export const AdminRoute = ({ children, fallback = null }) => {
  return (
    <ProtectedRoute requireAuth={true} requireRole="admin" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
};

/**
 * Staff Route Component
 * For routes that require staff role
 */
export const StaffRoute = ({ children, fallback = null }) => {
  return (
    <ProtectedRoute requireAuth={true} requireRole="staff" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
};

/**
 * Guest Route Component
 * For routes accessible by both authenticated and non-authenticated users
 */
export const GuestRoute = ({ children }) => {
  return children;
};

export default ProtectedRoute;
