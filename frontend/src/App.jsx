import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { AuthProvider } from "@contexts/AuthContext";
import { ToastProvider } from "@components/Common/Toast";
import {
  PrivateRoute,
  PublicRoute,
  AdminRoute,
  StaffRoute,
} from "@components/Auth/ProtectedRoute";

// Pages
import Login from "@pages/Login";
import Register from "@pages/Register";
import Home from "@pages/Home";
import Profile from "@pages/Profile";
import Dashboard from "@pages/Dashboard";
import NotFound from "@pages/NotFound";

// Room Pages
import Rooms from "@pages/Rooms";
import RoomDetail from "@pages/RoomDetail";
import SearchResults from "@pages/SearchResults";

// Booking Pages
import BookingPage from "@pages/BookingPage";
import BookingConfirmation from "@pages/BookingConfirmation";
import BookingHistory from "@pages/BookingHistory";

// Admin Pages
import AdminDashboard from "@pages/admin/AdminDashboard";

// Staff Pages
import StaffDashboard from "@pages/staff/StaffDashboard";

// Layouts
import MainLayout from "@components/Layout/MainLayout";
import AuthLayout from "@components/Layout/AuthLayout";

// Constants
import { ROUTES } from "@utils/constants";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

/**
 * Main App Component
 * Sets up routing, providers, and global layout
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route
                  path={ROUTES.HOME}
                  element={
                    <MainLayout>
                      <Home />
                    </MainLayout>
                  }
                />

                {/* Room Routes (Public) */}
                <Route
                  path="/rooms"
                  element={
                    <MainLayout>
                      <Rooms />
                    </MainLayout>
                  }
                />

                <Route
                  path="/rooms/:roomId"
                  element={
                    <MainLayout>
                      <RoomDetail />
                    </MainLayout>
                  }
                />

                <Route
                  path="/search"
                  element={
                    <MainLayout>
                      <SearchResults />
                    </MainLayout>
                  }
                />

                {/* Booking Routes */}
                <Route
                  path="/booking/:roomId"
                  element={
                    <PrivateRoute>
                      <MainLayout>
                        <BookingPage />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/booking/confirmation"
                  element={
                    <PrivateRoute>
                      <MainLayout>
                        <BookingConfirmation />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/booking/history"
                  element={
                    <PrivateRoute>
                      <MainLayout>
                        <BookingHistory />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />

                {/* Alternative route for bookings (same as booking/history) */}
                <Route
                  path="/bookings"
                  element={
                    <PrivateRoute>
                      <MainLayout>
                        <BookingHistory />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />

                {/* Auth Routes (only for non-authenticated users) */}
                <Route
                  path={ROUTES.LOGIN}
                  element={
                    <PublicRoute>
                      <AuthLayout>
                        <Login />
                      </AuthLayout>
                    </PublicRoute>
                  }
                />

                <Route
                  path={ROUTES.REGISTER}
                  element={
                    <PublicRoute>
                      <AuthLayout>
                        <Register />
                      </AuthLayout>
                    </PublicRoute>
                  }
                />

                {/* Protected Routes (require authentication) */}
                <Route
                  path={ROUTES.DASHBOARD}
                  element={
                    <PrivateRoute requireRole="customer">
                      <MainLayout>
                        <Dashboard />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />

                <Route
                  path={ROUTES.PROFILE}
                  element={
                    <PrivateRoute>
                      <MainLayout>
                        <Profile />
                      </MainLayout>
                    </PrivateRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path={ROUTES.ADMIN.DASHBOARD}
                  element={
                    <AdminRoute>
                      <MainLayout>
                        <AdminDashboard />
                      </MainLayout>
                    </AdminRoute>
                  }
                />

                {/* Staff Routes */}
                <Route
                  path={ROUTES.STAFF.DASHBOARD}
                  element={
                    <StaffRoute>
                      <MainLayout>
                        <StaffDashboard />
                      </MainLayout>
                    </StaffRoute>
                  }
                />

                {/* 404 Route */}
                <Route
                  path="*"
                  element={
                    <MainLayout>
                      <NotFound />
                    </MainLayout>
                  }
                />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ToastProvider>
      {/* React Query Devtools */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
