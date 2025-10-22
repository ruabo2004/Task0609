import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  UsersIcon,
  DocumentChartBarIcon,
  CogIcon,
  ChartBarIcon,
  UserGroupIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Sidebar component for dashboard navigation
 */
const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Navigation items based on user role
  const getNavigation = () => {
    const baseItems = [
      {
        name: 'Trang Chủ',
        href: `/${user?.role}/dashboard`,
        icon: HomeIcon,
      },
    ];

    switch (user?.role) {
      case 'customer':
        return [
          ...baseItems,
          {
            name: 'Đặt Phòng Của Tôi',
            href: '/customer/bookings',
            icon: CalendarDaysIcon,
          },
          {
            name: 'Hồ Sơ',
            href: '/customer/profile',
            icon: UsersIcon,
          },
        ];

      case 'staff':
        return [
          ...baseItems,
          {
            name: 'Đặt Phòng',
            href: '/staff/bookings',
            icon: CalendarDaysIcon,
          },
          {
            name: 'Hồ Sơ',
            href: '/staff/profile',
            icon: UsersIcon,
          },
        ];

      case 'admin':
        return [
          ...baseItems,
          {
            name: 'Đặt Phòng',
            href: '/admin/bookings',
            icon: CalendarDaysIcon,
          },
          {
            name: 'Quản Lý Phòng',
            href: '/admin/rooms',
            icon: BuildingOfficeIcon,
          },
          {
            name: 'Quản Lý Dịch Vụ',
            href: '/admin/services',
            icon: CogIcon,
          },
          {
            name: 'Người Dùng',
            href: '/admin/users',
            icon: UserGroupIcon,
          },
          {
            name: 'Tin Nhắn Liên Hệ',
            href: '/admin/contacts',
            icon: EnvelopeIcon,
          },
        ];

      default:
        return baseItems;
    }
  };

  const navigation = getNavigation();

  const isActiveLink = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">
              {user?.role === 'staff' ? 'Cổng Nhân Viên' : 
               user?.role === 'admin' ? 'Cổng Quản Trị' :
               user?.role === 'customer' ? 'Cổng Khách Hàng' :
               'Portal'}
            </h2>
            <button
              onClick={onClose}
              className="md:hidden text-gray-400 hover:text-white"
            >
              <span className="sr-only">Đóng menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = isActiveLink(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => onClose()}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer - Removed user info as it's now in header dropdown */}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
