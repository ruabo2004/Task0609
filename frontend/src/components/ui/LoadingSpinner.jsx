/**
 * LoadingSpinner component for showing loading states
 * @param {Object} props - Component props
 * @param {string} props.size - Spinner size (sm, md, lg, xl)
 * @param {string} props.color - Spinner color
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement} Loading spinner component
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'border-primary-600',
    secondary: 'border-gray-600',
    white: 'border-white',
    success: 'border-success-600',
    warning: 'border-warning-600',
    error: 'border-error-600',
  };

  return (
    <div
      className={`spinner ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
