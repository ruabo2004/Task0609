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
      name: 'My Profile',
      href: '/staff/profile',
      icon: 'UserIcon',
      description: 'Manage my staff profile',
    },
    {
      name: 'My Shifts',
      href: '/staff/shifts',
      icon: 'ClockIcon',
      description: 'View and manage my work shifts',
    },
    {
      name: 'My Tasks',
      href: '/staff/tasks',
      icon: 'CheckSquareIcon',
      description: 'Manage my assigned tasks',
    },
    {
      name: 'Attendance',
      href: '/staff/attendance',
      icon: 'CalendarCheckIcon',
      description: 'Check-in/out and view attendance',
    },
    {
      name: 'Bookings',
      href: '/staff/bookings',
      icon: 'CalendarDaysIcon',
      description: 'Manage all bookings',
    },
    {
      name: 'Rooms',
      href: '/staff/rooms',
      icon: 'BuildingOfficeIcon',
      description: 'Manage room inventory',
    },
    {
      name: 'Customers',
      href: '/staff/customers',
      icon: 'UsersIcon',
      description: 'Manage customer accounts',
    },
    {
      name: 'Reports',
      href: '/staff/reports',
      icon: 'DocumentChartBarIcon',
      description: 'View reports and analytics',
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
      name: 'Staff Management',
      href: '/admin/staff',
      icon: 'UserGroupIcon',
      description: 'Manage staff profiles and permissions',
    },
    {
      name: 'Staff Scheduling',
      href: '/admin/schedules',
      icon: 'CalendarDaysIcon',
      description: 'Manage staff shifts and schedules',
    },
    {
      name: 'Task Management',
      href: '/admin/tasks',
      icon: 'ClipboardDocumentListIcon',
      description: 'Assign and monitor staff tasks',
    },
    {
      name: 'Attendance Reports',
      href: '/admin/attendance',
      icon: 'ClockIcon',
      description: 'Monitor staff attendance and reports',
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: 'ChartPieIcon',
      description: 'Advanced analytics',
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: 'CogIcon',
      description: 'System configuration',
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
      return '/staff/dashboard';
    case 'admin':
      return '/admin/dashboard';
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
      rooms: '/staff/rooms',
      customers: '/staff/customers',
      reports: '/staff/reports',
      allowedPaths: ['/staff'],
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
