import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Home,
  Shield,
  Users,
} from "lucide-react";
import Button from "@components/Form/Button";
import { ROUTES } from "@utils/constants";

/**
 * Header Component
 * Navigation header with authentication state
 */
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout, isAdmin, isStaff, isCustomer } =
    useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  // Get navigation items based on user role
  const getNavItems = () => {
    const baseItems = [{ href: ROUTES.HOME, label: "Trang chủ" }];

    if (!isAuthenticated) {
      return [...baseItems, { href: "/rooms", label: "Homestay" }];
    }

    if (isAdmin()) {
      return [
        ...baseItems,
        { href: ROUTES.ADMIN.DASHBOARD, label: "Admin Dashboard" },
        { href: ROUTES.ADMIN.CUSTOMERS, label: "Khách hàng" },
        { href: ROUTES.ADMIN.EMPLOYEES, label: "Nhân viên" },
        { href: ROUTES.ADMIN.ROOMS, label: "Phòng" },
        { href: ROUTES.ADMIN.REPORTS, label: "Báo cáo" },
      ];
    }

    if (isStaff()) {
      return [
        ...baseItems,
        { href: ROUTES.STAFF.DASHBOARD, label: "Staff Dashboard" },
        { href: ROUTES.STAFF.BOOKINGS, label: "Quản lý Booking" },
        { href: ROUTES.STAFF.REPORTS, label: "Báo cáo ca làm" },
      ];
    }

    // Customer navigation
    return [
      ...baseItems,
      { href: "/rooms", label: "Homestay" },
      { href: ROUTES.DASHBOARD, label: "Dashboard" },
      { href: ROUTES.BOOKINGS, label: "Booking của tôi" },
    ];
  };

  const navItems = getNavItems();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={ROUTES.HOME} className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Homestay</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium">{user?.full_name}</span>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.full_name}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span
                        className={`
                        inline-flex items-center mt-1 px-2 py-1 rounded-full text-xs font-medium
                        ${
                          isAdmin()
                            ? "bg-red-100 text-red-800"
                            : isStaff()
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }
                      `}
                      >
                        {isAdmin() ? (
                          <>
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </>
                        ) : isStaff() ? (
                          <>
                            <Users className="w-3 h-3 mr-1" />
                            Nhân viên
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 mr-1" />
                            Khách hàng
                          </>
                        )}
                      </span>
                    </div>
                    <Link
                      to={ROUTES.PROFILE}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Thông tin cá nhân
                    </Link>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to={ROUTES.LOGIN}>
                  <Button variant="outline" size="sm">
                    Đăng nhập
                  </Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button variant="primary" size="sm">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900"
                  onClick={toggleMenu}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Auth */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.full_name}
                    </p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to={ROUTES.PROFILE}
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900"
                    onClick={toggleMenu}
                  >
                    Thông tin cá nhân
                  </Link>
                  <button
                    onClick={() => {
                      toggleMenu();
                      handleLogout();
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to={ROUTES.LOGIN}
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900"
                    onClick={toggleMenu}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to={ROUTES.REGISTER}
                    className="block px-3 py-2 text-base font-medium text-primary-600 hover:text-primary-800"
                    onClick={toggleMenu}
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay for dropdowns */}
      {(isUserMenuOpen || isMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsMenuOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;
