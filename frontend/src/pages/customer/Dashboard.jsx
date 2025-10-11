import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings, useUserBookingStats } from '@/hooks/useBookings';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  StatusBadge,
  Table,
} from '@/components';
import {
  CalendarDaysIcon,
  HomeIcon,
  CreditCardIcon,
  StarIcon,
  PlusIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

/**
 * Customer Dashboard - Overview of customer's account and recent activity
 */
const CustomerDashboard = () => {
  const { user } = useAuth();
  
  // Fetch user booking statistics
  const { data: stats, loading: statsLoading } = useUserBookingStats();
  
  // Create stable options objects
  const [recentBookingsOptions] = useState({
    immediate: true,
    page: 1,
    limit: 5,
    sort: 'created_at:desc'
  });

  // Fetch recent bookings
  const { 
    data: recentBookings, 
    loading: bookingsLoading 
  } = useBookings({}, recentBookingsOptions);
  
  // Create stable filter object for upcoming bookings
  const [upcomingFilters] = useState(() => ({
    status: 'confirmed',
    checkIn: { $gte: new Date().toISOString().split('T')[0] }
  }));

  const [upcomingBookingsOptions] = useState({
    immediate: true,
    page: 1,
    limit: 3,
    sort: 'check_in:asc'
  });

  // Fetch upcoming bookings
  const { 
    data: upcomingBookings, 
    loading: upcomingLoading 
  } = useBookings(upcomingFilters, upcomingBookingsOptions);

  const loading = statsLoading || bookingsLoading || upcomingLoading;

  // Process upcoming bookings to add daysUntil
  const processedUpcomingBookings = upcomingBookings?.map(booking => ({
    ...booking,
    daysUntil: Math.ceil((new Date(booking.checkIn) - new Date()) / (1000 * 60 * 60 * 24))
  })) || [];

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Recent bookings table columns
  const bookingColumns = [
    {
      key: 'roomName',
      title: 'Room',
      render: (value) => (
        <div className="font-medium text-gray-900">{value}</div>
      ),
    },
    {
      key: 'checkIn',
      title: 'Check-in',
      render: (value) => formatDate(value),
    },
    {
      key: 'checkOut',
      title: 'Check-out',
      render: (value) => formatDate(value),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value) => (
        <span className="font-medium text-gray-900">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      sortable: false,
      render: (_, row) => (
        <Button
          size="xs"
          variant="secondary"
          leftIcon={<EyeIcon className="h-3 w-3" />}
          to={`/customer/bookings/${row.id}`}
        >
          View
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.full_name}!</h1>
        <p className="mt-2 text-primary-100">
          Here's an overview of your homestay bookings and account activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarDaysIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalBookings || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HomeIcon className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.activeBookings || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <StarIcon className="h-6 w-6 text-warning-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.completedBookings || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCardIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.totalSpent || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="primary"
              leftIcon={<PlusIcon className="h-4 w-4" />}
              to="/rooms"
              fullWidth
            >
              Book New Room
            </Button>
            <Button
              variant="secondary"
              leftIcon={<CalendarDaysIcon className="h-4 w-4" />}
              to="/customer/bookings"
              fullWidth
            >
              View All Bookings
            </Button>
            <Button
              variant="secondary"
              leftIcon={<StarIcon className="h-4 w-4" />}
              to="/customer/profile"
              fullWidth
            >
              Update Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Bookings</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  to="/customer/bookings"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table
                columns={bookingColumns}
                data={recentBookings || []}
                size="sm"
                hoverable
                loading={bookingsLoading}
                emptyMessage="No recent bookings"
              />
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Bookings */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Stays</CardTitle>
            </CardHeader>
            <CardContent>
              {processedUpcomingBookings.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming bookings</p>
                  <Button
                    variant="primary"
                    size="sm"
                    to="/rooms"
                    className="mt-4"
                  >
                    Book Now
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {processedUpcomingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {booking.roomName}
                        </h4>
                        <Badge variant="primary" size="xs">
                          {booking.daysUntil} days
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                      </p>
                      <Button
                        variant="ghost"
                        size="xs"
                        to={`/customer/bookings/${booking.id}`}
                        className="mt-2"
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
