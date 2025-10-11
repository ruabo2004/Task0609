    import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { 
  UserCircleIcon,
  ChevronDownIcon,
  UserIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Header component for main layout
 */
const Header = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-bold text-primary-600">
              Quản Lý Homestay
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Trang Chủ
            </Link>
            <Link 
              to="/rooms" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Phòng
            </Link>
            <Link 
              to="/about" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Giới Thiệu
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Liên Hệ
            </Link>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Only show dashboard link for staff and admin, not customers */}
                {user.role !== 'customer' && (
                  <Link
                    to={`/${user.role}/dashboard`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Bảng Điều Khiển
                  </Link>
                )}
                
                {/* User dropdown menu */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <UserCircleIcon className="h-8 w-8" />
                    <span className="text-sm font-medium">
                      {user.full_name}
                    </span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>

                  {/* Dropdown menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                      <div className="py-1">
                        {/* User info section */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {user.full_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.email}
                          </p>
                          <p className="text-xs text-primary-600 capitalize font-medium">
                            {user.role}
                          </p>
                        </div>
                        
                        {/* Menu items */}
                        <Link
                          to="/customer/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <UserIcon className="h-4 w-4 mr-3" />
                          Thông Tin Cá Nhân
                        </Link>
                        
                        <Link
                          to="/customer/bookings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <ClockIcon className="h-4 w-4 mr-3" />
                          Lịch Sử Đặt Phòng
                        </Link>
                        
                        <hr className="my-1" />
                        
                        <button
                          onClick={() => {
                            handleLogout();
                            setShowUserMenu(false);
                          }}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                          Đăng Xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/auth/login"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Đăng Nhập
                </Link>
                <Link
                  to="/auth/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                >
                  Đăng Ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
