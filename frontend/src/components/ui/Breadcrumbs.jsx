import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

/**
 * Breadcrumbs component for navigation
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of breadcrumb items
 * @returns {React.ReactElement} Breadcrumbs component
 */
const Breadcrumbs = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <nav className="flex py-3" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-4">
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              {index > 0 && (
                <ChevronRightIcon className="flex-shrink-0 h-4 w-4 text-gray-400 mr-4" />
              )}
              {item.current ? (
                <span className="text-sm font-medium text-gray-500" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors duration-200"
                >
                  {item.name}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
