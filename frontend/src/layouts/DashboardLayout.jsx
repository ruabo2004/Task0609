import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getPageTitle, getBreadcrumbs } from '@/utils/navigation';

// Components
import DashboardHeader from '@/components/layout/DashboardHeader';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

/**
 * DashboardLayout component for authenticated user dashboards
 * @param {Object} props - Component props
 * @param {string} props.userRole - User role for sidebar configuration
 */
const DashboardLayout = ({ userRole }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  // Update document title based on current route
  useEffect(() => {
    document.title = getPageTitle(location.pathname);
  }, [location.pathname]);

  // Get breadcrumbs for current path
  const breadcrumbs = getBreadcrumbs(location.pathname);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        userRole={userRole || user?.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Dashboard Header */}
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
        />

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {/* Breadcrumbs */}
          <div className="bg-white border-b border-gray-200">
            <div className="px-4 sm:px-6 lg:px-8">
              <Breadcrumbs items={breadcrumbs} />
            </div>
          </div>

          {/* Page content */}
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
