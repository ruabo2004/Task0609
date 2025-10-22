import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

// Public Pages
import HomePage from '@/pages/public/HomePage';
import AboutPage from '@/pages/public/AboutPage';
import ContactPage from '@/pages/public/ContactPage';
import RoomsPage from '@/pages/public/RoomsPage';
import RoomDetailPage from '@/pages/public/RoomDetailPage';
import BookingPage from '@/pages/public/BookingPage';
import PaymentSuccess from '@/pages/payment/PaymentSuccess';
import PaymentFailed from '@/pages/payment/PaymentFailed';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

// Customer Dashboard Pages
import CustomerDashboard from '@/pages/customer/Dashboard';
import MyBookings from '@/pages/customer/MyBookings';
import BookingDetail from '@/pages/customer/BookingDetail';
import Profile from '@/pages/customer/Profile';

// Staff Dashboard Pages (per yêu cầu.txt: only booking management + add services)
import StaffDashboard from '@/pages/staff/Dashboard';
import StaffBookings from '@/pages/staff/BookingManagement';
import StaffProfile from '@/pages/staff/Profile';

// Admin Dashboard Pages (per yêu cầu.txt: CRUD rooms/staff/services/customers + booking management + dashboard)
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminUsers from '@/pages/admin/UserManagement';
import AdminRooms from '@/pages/admin/RoomManagement';
import AdminServices from '@/pages/admin/ServiceManagement';
import AdminContacts from '@/pages/admin/ContactManagement';

// Protected Route Components
import ProtectedRoute from '@/components/routing/ProtectedRoute';
import RoleBasedRoute from '@/components/routing/RoleBasedRoute';

// Error Pages
import NotFoundPage from '@/pages/errors/NotFoundPage';
import UnauthorizedPage from '@/pages/errors/UnauthorizedPage';
import ErrorBoundary from '@/components/errors/ErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'contact',
        element: <ContactPage />,
      },
      {
        path: 'rooms',
        children: [
          {
            index: true,
            element: <RoomsPage />,
          },
          {
            path: ':id',
            element: <RoomDetailPage />,
          },
        ],
      },
      {
        path: 'booking',
        children: [
          {
            path: 'new',
            element: (
              <RoleBasedRoute allowedRoles={['customer']} redirectTo="/admin/users">
                <BookingPage />
              </RoleBasedRoute>
            ),
          },
        ],
      },
      {
        path: 'payment',
        children: [
          {
            path: 'success',
            element: <PaymentSuccess />,
          },
          {
            path: 'failed',
            element: <PaymentFailed />,
          },
        ],
      },
    ],
  },
  
  // Authentication Routes
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/auth/login" replace />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
    ],
  },

  // Customer Routes (using MainLayout, no dashboard)
  {
    path: '/customer',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute allowedRoles={['customer']}>
          <MainLayout />
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/" replace />, // Redirect to homepage instead of dashboard
      },
      {
        path: 'bookings',
        children: [
          {
            index: true,
            element: <MyBookings />,
          },
          {
            path: ':id',
            element: <BookingDetail />,
          },
        ],
      },
      {
        path: 'profile',
        element: <Profile />,
      },
    ],
  },

  // Staff Dashboard Routes (Simplified per yêu cầu.txt)
  {
    path: '/staff',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute allowedRoles={['staff', 'admin']}>
          <DashboardLayout userRole="staff" />
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/staff/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <StaffDashboard />,
      },
      {
        path: 'bookings',
        element: <StaffBookings />,
      },
      {
        path: 'profile',
        element: <StaffProfile />,
      },
    ],
  },

  // Admin Dashboard Routes (Simplified per yêu cầu.txt)
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute allowedRoles={['admin']}>
          <DashboardLayout userRole="admin" />
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'bookings',
        element: <StaffBookings />,
      },
      {
        path: 'rooms',
        element: <AdminRooms />,
      },
      {
        path: 'services',
        element: <AdminServices />,
      },
      {
        path: 'users',
        element: <AdminUsers />,
      },
      {
        path: 'contacts',
        element: <AdminContacts />,
      },
    ],
  },

  // Error Routes
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/404',
    element: <NotFoundPage />,
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
]);

export default router;
