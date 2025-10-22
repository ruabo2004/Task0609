/**
 * Navigation utility functions for the application
 */

/**
 * Get navigation items based on user role
 * @param {string} userRole - User role (customer, staff, admin)
 * @returns {Array} Array of navigation items
 */
export const getNavigationItems = (userRole) => {
  const baseNavigation = [
    {
      name: 'Home',
      href: '/',
      icon: 'HomeIcon',
      description: 'Return to homepage',
    },
    {
      name: 'Rooms',
      href: '/rooms',
      icon: 'BuildingOfficeIcon',
      description: 'Browse available rooms',
    },
    {
      name: 'About',
      href: '/about',
      icon: 'InformationCircleIcon',
      description: 'Learn about us',
    },
    {
      name: 'Contact',
      href: '/contact',
      icon: 'PhoneIcon',
      description: 'Get in touch',
    },
  ];

  const customerNavigation = [
    {
      name: 'Dashboard',
      href: '/customer/dashboard',
      icon: 'ChartBarIcon',
      description: 'Overview of your account',
    },
    {
      name: 'My Bookings',
      href: '/customer/bookings',
      icon: 'CalendarDaysIcon',
      description: 'View and manage bookings',
    },
    {
      name: 'Profile',
      href: '/customer/profile',
      icon: 'UserIcon',
      description: 'Manage your profile',
    },
  ];

  const staffNavigation = [
    {
      name: 'Dashboard',
      href: '/staff/dashboard',
      icon: 'ChartBarIcon',
      description: 'Staff overview and metrics',
    },
    {
      name: 'Bookings',
      href: '/staff/bookings',
      icon: 'CalendarDaysIcon',
      description: 'Manage all bookings',
    },
  ];

  const adminNavigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: 'ChartBarIcon',
      description: 'Admin overview and metrics',
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: 'UsersIcon',
      description: 'Manage all users',
    },
    {
      name: 'Room Management',
      href: '/admin/rooms',
      icon: 'HomeIcon',
      description: 'Manage rooms',
    },
    {
      name: 'Service Management',
      href: '/admin/services',
      icon: 'WrenchScrewdriverIcon',
      description: 'Manage services',
    },
    {
      name: 'Contact Forms',
      href: '/admin/contacts',
      icon: 'EnvelopeIcon',
      description: 'Manage contact form submissions',
    },
  ];

  switch (userRole) {
    case 'customer':
      return [...baseNavigation, ...customerNavigation];
    case 'staff':
      return [...staffNavigation];
    case 'admin':
      return [...adminNavigation];
    default:
      return baseNavigation;
  }
};

/**
 * Get breadcrumb items for current path
 * @param {string} pathname - Current pathname
 * @param {Object} params - Route parameters
 * @returns {Array} Array of breadcrumb items
 */
export const getBreadcrumbs = (pathname, params = {}) => {
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    {
      name: 'Home',
      href: '/',
      current: false,
    },
  ];

  let currentPath = '';
  
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;
    
    // Custom breadcrumb names
    const breadcrumbNames = {
      'customer': 'Customer Portal',
      'staff': 'Staff Portal',
      'admin': 'Admin Portal',
      'dashboard': 'Dashboard',
      'bookings': 'Bookings',
      'rooms': 'Rooms',
      'users': 'Users',
      'profile': 'Profile',
      'settings': 'Settings',
      'analytics': 'Analytics',
      'reports': 'Reports',
      'customers': 'Customers',
      'auth': 'Authentication',
      'login': 'Login',
      'register': 'Register',
      'forgot-password': 'Forgot Password',
      'reset-password': 'Reset Password',
      'about': 'About Us',
      'contact': 'Contact Us',
    };

    const name = breadcrumbNames[segment] || 
                 (params[segment] ? `${segment} #${params[segment]}` : 
                  segment.charAt(0).toUpperCase() + segment.slice(1));

    breadcrumbs.push({
      name,
      href: currentPath,
      current: isLast,
    });
  });

  return breadcrumbs;
};

/**
 * Check if current path is active
 * @param {string} path - Path to check
 * @param {string} currentPath - Current pathname
 * @param {boolean} exact - Whether to match exactly or include children
 * @returns {boolean} Whether path is active
 */
export const isActivePath = (path, currentPath, exact = false) => {
  if (exact) {
    return path === currentPath;
  }
  
  if (path === '/') {
    return currentPath === '/';
  }
  
  return currentPath.startsWith(path);
};

/**
 * Get dashboard redirect path based on user role
 * @param {string} userRole - User role
 * @returns {string} Dashboard path
 */
export const getDashboardPath = (userRole) => {
  switch (userRole) {
    case 'customer':
      return '/'; // Customer goes to homepage after login
    case 'staff':
      return '/staff/dashboard'; // Staff goes to staff dashboard after login
    case 'admin':
      return '/admin/dashboard'; // Admin goes to admin dashboard after login
    default:
      return '/';
  }
};

/**
 * Get user-specific routes
 * @param {string} userRole - User role
 * @returns {Object} Routes configuration for the user
 */
export const getUserRoutes = (userRole) => {
  const routes = {
    customer: {
      base: '/customer',
      dashboard: '/customer/dashboard',
      bookings: '/customer/bookings',
      profile: '/customer/profile',
      allowedPaths: ['/customer', '/rooms', '/', '/about', '/contact'],
    },
    staff: {
      base: '/staff',
      dashboard: '/staff/dashboard',
      bookings: '/staff/bookings',
      allowedPaths: ['/staff'], // Staff CANNOT access customer booking pages (/rooms, /booking/new)
    },
    admin: {
      base: '/admin',
      dashboard: '/admin/dashboard',
      users: '/admin/users',
      analytics: '/admin/analytics',
      settings: '/admin/settings',
      allowedPaths: ['/admin', '/staff'],
    },
  };

  return routes[userRole] || { allowedPaths: ['/', '/rooms', '/about', '/contact'] };
};

/**
 * Check if user can access a specific path
 * @param {string} path - Path to check
 * @param {string} userRole - User role
 * @returns {boolean} Whether user can access the path
 */
export const canAccessPath = (path, userRole) => {
  if (!userRole) {
    // Guest users can only access public paths
    const publicPaths = ['/', '/rooms', '/about', '/contact', '/auth'];
    return publicPaths.some(publicPath => 
      path === publicPath || path.startsWith(publicPath + '/')
    );
  }

  const userRoutes = getUserRoutes(userRole);
  return userRoutes.allowedPaths.some(allowedPath => 
    path === allowedPath || path.startsWith(allowedPath + '/')
  );
};

/**
 * Generate page title based on current route
 * @param {string} pathname - Current pathname
 * @param {Object} params - Route parameters
 * @returns {string} Page title
 */
export const getPageTitle = (pathname, params = {}) => {
  const pathSegments = pathname.split('/').filter(Boolean);
  const appName = 'Homestay Management';
  
  if (pathname === '/') {
    return appName;
  }

  const titleMap = {
    'customer': 'Customer Portal',
    'staff': 'Staff Portal', 
    'admin': 'Admin Portal',
    'dashboard': 'Dashboard',
    'bookings': 'Bookings',
    'rooms': 'Rooms',
    'users': 'User Management',
    'profile': 'Profile',
    'settings': 'Settings',
    'analytics': 'Analytics',
    'reports': 'Reports',
    'customers': 'Customer Management',
    'auth': 'Authentication',
    'login': 'Sign In',
    'register': 'Sign Up',
    'forgot-password': 'Forgot Password',
    'reset-password': 'Reset Password',
    'about': 'About Us',
    'contact': 'Contact Us',
  };

  const lastSegment = pathSegments[pathSegments.length - 1];
  const title = titleMap[lastSegment] || 
                lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  
  return `${title} | ${appName}`;
};
