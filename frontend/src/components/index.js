// Export all components for easy importing

// Create separate component files for layout components
export { default as Header } from './layout/Header.jsx';
export { default as Footer } from './layout/Footer.jsx';
export { default as DashboardHeader } from './layout/DashboardHeader.jsx';
export { default as Sidebar } from './layout/Sidebar.jsx';

// UI Components
export { default as LoadingSpinner } from './ui/LoadingSpinner.jsx';
export { default as ScrollToTop } from './ui/ScrollToTop.jsx';
export { default as Breadcrumbs } from './ui/Breadcrumbs.jsx';
export { default as Button } from './ui/Button.jsx';
export { default as Input } from './ui/Input.jsx';
export { default as Card, CardHeader, CardTitle, CardContent, CardActions } from './ui/Card.jsx';
export { default as Modal, ConfirmModal, AlertModal } from './ui/Modal.jsx';
export { default as Select } from './ui/Select.jsx';
export { default as Table, TablePagination } from './ui/Table.jsx';
export { default as Badge, StatusBadge, CountBadge, DotIndicator } from './ui/Badge.jsx';
export { default as Calendar } from './ui/Calendar.jsx';

// Routing Components  
export { default as ProtectedRoute } from './routing/ProtectedRoute.jsx';
export { default as RoleBasedRoute } from './routing/RoleBasedRoute.jsx';
