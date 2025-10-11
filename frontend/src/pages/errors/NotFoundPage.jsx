import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';

/**
 * NotFoundPage component for 404 errors
 */
const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* 404 Number */}
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          
          {/* Error Message */}
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            Page not found
          </h2>
          
          <p className="mt-4 text-lg text-gray-600">
            Sorry, we couldn't find the page you're looking for.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            >
              <HomeIcon className="h-4 w-4 mr-2" />
              Go back home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;