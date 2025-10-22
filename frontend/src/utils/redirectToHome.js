// Utility to redirect to home on page refresh
// This checks if the page was refreshed and redirects to home

export const setupRefreshRedirect = () => {
  // Check if this is a page refresh (not initial load)
  const isRefresh = performance.navigation.type === 1 || 
                    performance.getEntriesByType('navigation')[0]?.type === 'reload';
  
  // If it's a refresh and not on home page, redirect to home
  if (isRefresh && window.location.pathname !== '/') {
    window.location.href = '/';
  }
};

// Alternative: Only redirect certain paths
export const setupConditionalRefreshRedirect = (excludePaths = ['/']) => {
  const isRefresh = performance.navigation.type === 1 || 
                    performance.getEntriesByType('navigation')[0]?.type === 'reload';
  
  const currentPath = window.location.pathname;
  const shouldRedirect = isRefresh && !excludePaths.some(path => currentPath.startsWith(path));
  
  if (shouldRedirect) {
    window.location.href = '/';
  }
};

