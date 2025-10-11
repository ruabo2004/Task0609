import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

/**
 * ErrorBoundary component to catch JavaScript errors anywhere in the component tree
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console and monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // You can also log the error to an error reporting service here
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  handleReload = () => {
    // Reload the page
    window.location.reload();
  };

  handleGoHome = () => {
    // Navigate to home page
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-error-100">
                <ExclamationTriangleIcon className="h-8 w-8 text-error-600" />
              </div>
              
              {/* Error Message */}
              <h1 className="mt-6 text-3xl font-bold text-gray-900">
                Oops! Something went wrong
              </h1>
              
              <p className="mt-4 text-lg text-gray-600">
                We're sorry, but something unexpected happened. Please try again.
              </p>

              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-6 p-4 bg-gray-100 rounded-md text-left">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Error Details (Development):
                  </h3>
                  <pre className="text-xs text-gray-700 overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={this.handleReload}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Try again
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                >
                  Go to homepage
                </button>
              </div>

              {/* Report Issue */}
              <div className="mt-8">
                <p className="text-sm text-gray-600">
                  If this problem persists, please{' '}
                  <a
                    href="/contact"
                    className="font-medium text-primary-600 hover:text-primary-500 underline"
                  >
                    contact support
                  </a>{' '}
                  with details about what you were doing when this error occurred.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
