import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * AuthLayout component for authentication pages
 * Redirects authenticated users to their dashboard
 */
const AuthLayout = () => {
  const { user, loading } = useAuth();

  // Show loading while checking authentication status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If user is already authenticated, redirect to appropriate dashboard
  if (user) {
    const dashboardPaths = {
      customer: '/customer/dashboard',
      staff: '/staff/dashboard',
      admin: '/admin/dashboard',
    };
    
    const redirectPath = dashboardPaths[user.role] || '/';
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Homestay Management
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          © 2024 Homestay Management. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
