import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getPageTitle } from '@/utils/navigation';

// Components
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/ui/ScrollToTop';

/**
 * MainLayout component for public pages
 * Includes header, footer, and main content area
 */
const MainLayout = () => {
  const location = useLocation();

  // Update document title based on current route
  useEffect(() => {
    document.title = getPageTitle(location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
};

export default MainLayout;
