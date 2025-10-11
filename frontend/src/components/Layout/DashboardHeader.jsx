import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bars3Icon, 
  BellIcon, 
  UserCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

/**
 * DashboardHeader component for dashboard layout
 */
const DashboardHeader = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center px-4 py-3">
        {/* Left: Menu button (mobile) */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          {/* Page title or breadcrumb could go here */}
          <div className="hidden md:block ml-4">
            <h1 className="text-lg font-semibold text-gray-900">
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Dashboard
            </h1>
          </div>
        </div>

        {/* Right: User info and actions */}
        <div className="flex items-center space-x-4">

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <UserCircleIcon className="h-8 w-8" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role || 'Role'}
                </p>
              </div>
              <ChevronDownIcon className="h-4 w-4" />
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <Link
                    to={`/${user?.role}/profile`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Về Trang Chủ
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Đăng Xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
