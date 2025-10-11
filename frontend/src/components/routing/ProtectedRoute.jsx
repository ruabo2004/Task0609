import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * ProtectedRoute component to guard routes that require authentication
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string} props.redirectTo - Path to redirect if not authenticated
 * @returns {React.ReactElement} Protected route component
 */
const ProtectedRoute = ({ 
  children, 
  redirectTo = '/auth/login' 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If user is not authenticated, redirect to login with return URL
  if (!user) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // If user is authenticated but not active, show appropriate message
  if (!user.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Account Inactive
          </h2>
          <p className="text-gray-600 mb-6">
            Your account has been deactivated. Please contact support for assistance.
          </p>
          <button
            onClick={() => window.location.href = '/auth/login'}
            className="btn-primary"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // If authenticated and active, render the protected content
  return children;
};

export default ProtectedRoute;
