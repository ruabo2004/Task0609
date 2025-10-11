import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();

  // If no user (shouldn't happen if ProtectedRoute is used properly)
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Check if user's role is in the allowed roles
  const hasRequiredRole = allowedRoles.includes(user.role);

  if (!hasRequiredRole) {
    return <Navigate to={redirectTo} replace />;
  }

  // If role is allowed, render the content
  return children;
};

export default RoleBasedRoute;
