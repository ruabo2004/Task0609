import { Link } from 'react-router-dom';
import { ShieldExclamationIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

/**
 * UnauthorizedPage component for 403 errors
 */
const UnauthorizedPage = () => {
  const { user, getDashboard } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-error-100">
            <ShieldExclamationIcon className="h-8 w-8 text-error-600" />
          </div>
          
          {/* Error Code */}
          <h1 className="mt-6 text-6xl font-bold text-error-600">403</h1>
          
          {/* Error Message */}
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            Access Denied
          </h2>
          
          <p className="mt-4 text-lg text-gray-600">
            You don't have permission to access this page.
          </p>

          {/* User-specific message */}
          {user ? (
            <div className="mt-4 p-4 bg-yellow-50 rounded-md">
              <p className="text-sm text-yellow-800">
                Logged in as: <strong>{user.full_name}</strong> ({user.role})
                <br />
                You need different permissions to access this resource.
              </p>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                You need to be logged in to access this page.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                to={getDashboard()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/auth/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                Sign In
              </Link>
            )}
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Go back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;