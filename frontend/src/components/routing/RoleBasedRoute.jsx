import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * RoleBasedRoute component to restrict access based on user roles
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if role is allowed
 * @param {string[]} props.allowedRoles - Array of roles that can access this route
 * @param {string} props.redirectTo - Path to redirect if role is not allowed
 * @returns {React.ReactElement} Role-based route component
 */
const RoleBasedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/unauthorized' 
}) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Show loading while checking auth
  if (loading) {
    console.log('RoleBasedRoute: Loading...', { loading, user, isAuthenticated });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If no user (shouldn't happen if ProtectedRoute is used properly)
  if (!user) {
    console.log('RoleBasedRoute: No user, redirecting to login');
    return <Navigate to="/auth/login" replace />;
  }

  // Check if user's role is in the allowed roles
  const hasRequiredRole = allowedRoles.includes(user.role);

  console.log('RoleBasedRoute: Checking access', {
    userRole: user.role,
    allowedRoles,
    hasRequiredRole,
    redirectTo,
    user
  });

  if (!hasRequiredRole) {
    console.log('RoleBasedRoute: Access denied, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  // If role is allowed, render the content
  console.log('RoleBasedRoute: Access granted');
  return children;
};

export default RoleBasedRoute;
