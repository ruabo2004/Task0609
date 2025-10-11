// Export all pages for easy importing

// Public pages
export { default as HomePage } from './public/HomePage.jsx';
export const AboutPage = () => PlaceholderPage({ title: "About Us", description: "Learn more about our homestay services." });
export const ContactPage = () => PlaceholderPage({ title: "Contact Us", description: "Get in touch with our support team." });
export const RoomsPage = () => PlaceholderPage({ title: "Our Rooms", description: "Browse our available accommodations." });
export const RoomDetailPage = () => PlaceholderPage({ title: "Room Details", description: "Detailed information about this room." });

// Auth pages
export { default as LoginPage } from './auth/LoginPage.jsx';
export const RegisterPage = () => PlaceholderPage({ title: "Create Account", description: "Sign up for a new account." });
export const ForgotPasswordPage = () => PlaceholderPage({ title: "Forgot Password", description: "Reset your password." });
export const ResetPasswordPage = () => PlaceholderPage({ title: "Reset Password", description: "Create a new password." });

// Customer pages
export const CustomerDashboard = () => PlaceholderPage({ title: "Customer Dashboard", description: "Your personal dashboard." });
export const MyBookings = () => PlaceholderPage({ title: "My Bookings", description: "View and manage your bookings." });
export const BookingDetail = () => PlaceholderPage({ title: "Booking Details", description: "Detailed booking information." });
export const Profile = () => PlaceholderPage({ title: "My Profile", description: "Manage your account settings." });

// Staff pages (per yêu cầu.txt: only booking management + add services)
export { default as StaffDashboard } from './staff/Dashboard.jsx';
export { default as StaffBookingManagement } from './staff/BookingManagement.jsx';
export const StaffProfile = () => PlaceholderPage({ title: "My Profile", description: "Staff profile settings." });

// Admin pages (per yêu cầu.txt: CRUD for rooms/services + booking management + dashboard)
export { default as AdminDashboard } from './admin/Dashboard.jsx';
export { default as UserManagement } from './admin/UserManagement.jsx';

// Error pages
export const NotFoundPage = () => PlaceholderPage({ title: "404 - Page Not Found", description: "The page you're looking for doesn't exist." });
export const UnauthorizedPage = () => PlaceholderPage({ title: "403 - Unauthorized", description: "You don't have permission to access this page." });
export const ErrorBoundary = () => PlaceholderPage({ title: "Something went wrong", description: "An unexpected error occurred." });
