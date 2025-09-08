import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center py-4">
          <Link 
            to="/" 
            className="text-xl font-bold text-primary-color hover:text-primary-dark transition-colors"
            onClick={closeMenu}
          >
            Homestay Management
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActivePath('/') 
                  ? 'bg-primary-color text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Trang chủ
            </Link>

            <Link
              to="/rooms"
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActivePath('/rooms') 
                  ? 'bg-primary-color text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Phòng
            </Link>

            {isAuthenticated() ? (
              <>
                <Link
                  to="/booking-history"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActivePath('/booking-history') 
                      ? 'bg-primary-color text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Lịch sử đặt phòng
                </Link>

                <div className="relative group">
                  <button className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                    {currentUser?.full_name || 'Tài khoản'}
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg"
                    >
                      Thông tin cá nhân
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-b-lg"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-color transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isActivePath('/') 
                    ? 'bg-primary-color text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={closeMenu}
              >
                Trang chủ
              </Link>

              <Link
                to="/rooms"
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isActivePath('/rooms') 
                    ? 'bg-primary-color text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={closeMenu}
              >
                Phòng
              </Link>

              {isAuthenticated() ? (
                <>
                  <Link
                    to="/booking-history"
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      isActivePath('/booking-history') 
                        ? 'bg-primary-color text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={closeMenu}
                  >
                    Lịch sử đặt phòng
                  </Link>

                  <Link
                    to="/profile"
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      isActivePath('/profile') 
                        ? 'bg-primary-color text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={closeMenu}
                  >
                    Thông tin cá nhân
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-left"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={closeMenu}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary"
                    onClick={closeMenu}
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;