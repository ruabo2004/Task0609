import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';

// Main hook for customer management
export const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // If we have a search term, use the search API
      if (filters.search && filters.search.trim()) {
        const response = await apiService.users.search({ 
          query: filters.search,
          role: 'customer', 
          ...filters 
        });
        if (response.data && response.data.success) {
          const customersData = response.data.data;
          setCustomers(Array.isArray(customersData) ? customersData : []);
          return;
        }
      } else {
        // Try to get all customers using getAll
        try {
          const response = await apiService.users.getAll({ role: 'customer', ...filters });
          if (response.data && response.data.success) {
            const customersData = response.data.data;
            setCustomers(Array.isArray(customersData) ? customersData : []);
            return;
          }
        } catch (getAllError) {

          // Fallback to sample data if API fails
          const filteredSampleCustomers = getSampleCustomers(filters);
          setCustomers(filteredSampleCustomers);
          return;
        }
      }
      
    } catch (err) {
      // Only log error if we were actually trying to search (not for initial load)
      if (filters.search && filters.search.trim()) {
        console.error('Search API Error:', err);
        setError(err.message);
        toast.error('Không thể tìm kiếm từ server, đang sử dụng dữ liệu mẫu');
      }
      // Fallback to sample data with filtering
      const filteredSampleCustomers = getSampleCustomers(filters);
      setCustomers(filteredSampleCustomers);
    } finally {
      setLoading(false);
    }
  }, []);

  const getSampleCustomers = (filters = {}) => {
    let sampleCustomers = [
      {
        id: 1,
        full_name: 'Nguyễn Văn An',
        email: 'nguyenvanan@gmail.com',
        phone: '0901234567',
        date_of_birth: '1990-05-15',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        status: 'active',
        total_bookings: 5,
        total_spent: 2500000,
        last_booking_date: '2025-09-15',
        created_at: '2024-01-15T10:30:00Z',
        loyalty_level: 'gold'
      },
      {
        id: 2,
        full_name: 'Trần Thị Bình',
        email: 'tranthibinh@gmail.com',
        phone: '0912345678',
        date_of_birth: '1985-08-22',
        address: '456 Đường XYZ, Quận 3, TP.HCM',
        status: 'active',
        total_bookings: 12,
        total_spent: 6000000,
        last_booking_date: '2025-10-01',
        created_at: '2023-06-10T14:20:00Z',
        loyalty_level: 'platinum'
      },
      {
        id: 3,
        full_name: 'Lê Minh Cường',
        email: 'leminhcuong@gmail.com',
        phone: '0923456789',
        date_of_birth: '1992-12-03',
        address: '789 Đường DEF, Quận 7, TP.HCM',
        status: 'active',
        total_bookings: 2,
        total_spent: 800000,
        last_booking_date: '2025-08-20',
        created_at: '2024-07-05T09:15:00Z',
        loyalty_level: 'silver'
      },
      {
        id: 4,
        full_name: 'Phạm Thị Dung',
        email: 'phamthidung@gmail.com',
        phone: '0934567890',
        date_of_birth: '1988-03-18',
        address: '321 Đường GHI, Quận 5, TP.HCM',
        status: 'inactive',
        total_bookings: 1,
        total_spent: 300000,
        last_booking_date: '2024-12-10',
        created_at: '2024-11-20T16:45:00Z',
        loyalty_level: 'bronze'
      },
      {
        id: 5,
        full_name: 'Hoàng Văn Em',
        email: 'hoangvanem@gmail.com',
        phone: '0945678901',
        date_of_birth: '1995-07-25',
        address: '654 Đường JKL, Quận 2, TP.HCM',
        status: 'active',
        total_bookings: 8,
        total_spent: 4200000,
        last_booking_date: '2025-09-28',
        created_at: '2023-12-01T11:30:00Z',
        loyalty_level: 'gold'
      }
    ];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      sampleCustomers = sampleCustomers.filter(customer =>
        customer.full_name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.phone.includes(filters.search)
      );
    }

    if (filters.status) {
      sampleCustomers = sampleCustomers.filter(customer => customer.status === filters.status);
    }

    if (filters.loyalty_level) {
      sampleCustomers = sampleCustomers.filter(customer => customer.loyalty_level === filters.loyalty_level);
    }

    return sampleCustomers;
  };

  const getCustomerStats = useCallback(() => {
    const customersArray = Array.isArray(customers) ? customers : [];
    return {
      total: customersArray.length,
      active: customersArray.filter(c => c.status === 'active').length,
      inactive: customersArray.filter(c => c.status === 'inactive').length,
      new_this_month: customersArray.filter(c => {
        const createdDate = new Date(c.created_at);
        const now = new Date();
        return createdDate.getMonth() === now.getMonth() && 
               createdDate.getFullYear() === now.getFullYear();
      }).length,
      total_revenue: customersArray.reduce((sum, c) => sum + (c.total_spent || 0), 0),
      avg_bookings: customersArray.length > 0 ? 
        customersArray.reduce((sum, c) => sum + (c.total_bookings || 0), 0) / customersArray.length : 0
    };
  }, [customers]);

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    getCustomerStats
  };
};

// Hook for customer details and booking history
export const useCustomerDetails = (customerId) => {
  const [customer, setCustomer] = useState(null);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomerDetails = useCallback(async () => {
    if (!customerId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch customer details
      const customerResponse = await apiService.users.getById(customerId);
      if (customerResponse.data && customerResponse.data.success) {
        setCustomer(customerResponse.data.data);
      } else {
        // Fallback to sample data
        const sampleCustomer = getSampleCustomerById(customerId);
        setCustomer(sampleCustomer);
      }

      // Fetch booking history
      try {
        const bookingsResponse = await apiService.bookings.getAll({ user_id: customerId });
        if (bookingsResponse.data && bookingsResponse.data.success) {
          setBookingHistory(bookingsResponse.data.data || []);
        } else {
          // Fallback to sample booking history
          const sampleBookings = getSampleBookingHistory(customerId);
          setBookingHistory(sampleBookings);
        }
      } catch (bookingError) {

        const sampleBookings = getSampleBookingHistory(customerId);
        setBookingHistory(sampleBookings);
      }
    } catch (err) {
      console.error('Fetch customer details error:', err);
      setError(err.message);
      
      // Fallback to sample data
      const sampleCustomer = getSampleCustomerById(customerId);
      setCustomer(sampleCustomer);
      const sampleBookings = getSampleBookingHistory(customerId);
      setBookingHistory(sampleBookings);
      
      toast.error('Không thể tải dữ liệu từ server, đang sử dụng dữ liệu mẫu');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const getSampleCustomerById = (id) => {
    const sampleCustomers = [
      {
        id: 1,
        full_name: 'Nguyễn Văn An',
        email: 'nguyenvanan@gmail.com',
        phone: '0901234567',
        date_of_birth: '1990-05-15',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        status: 'active',
        total_bookings: 5,
        total_spent: 2500000,
        last_booking_date: '2025-09-15',
        created_at: '2024-01-15T10:30:00Z',
        loyalty_level: 'gold'
      },
      // Add more sample customers as needed
    ];
    return sampleCustomers.find(c => c.id === parseInt(id)) || sampleCustomers[0];
  };

  const getSampleBookingHistory = (customerId) => {
    return [
      {
        id: 1,
        room_number: '101',
        check_in_date: '2025-09-10',
        check_out_date: '2025-09-15',
        total_amount: 500000,
        status: 'completed',
        created_at: '2025-09-05T10:00:00Z'
      },
      {
        id: 2,
        room_number: '205',
        check_in_date: '2025-07-20',
        check_out_date: '2025-07-25',
        total_amount: 750000,
        status: 'completed',
        created_at: '2025-07-15T14:30:00Z'
      },
      {
        id: 3,
        room_number: '103',
        check_in_date: '2025-11-01',
        check_out_date: '2025-11-05',
        total_amount: 600000,
        status: 'confirmed',
        created_at: '2025-10-25T09:15:00Z'
      }
    ];
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]);

  return {
    customer,
    bookingHistory,
    loading,
    error,
    refetch: fetchCustomerDetails
  };
};

// Hook for customer search and filtering
export const useCustomerSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    loyalty_level: '',
    date_range: ''
  });

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilters({
      status: '',
      loyalty_level: '',
      date_range: ''
    });
  }, []);

  const getSearchParams = useCallback(() => {
    return {
      search: searchTerm,
      ...filters
    };
  }, [searchTerm, filters]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    updateFilter,
    clearFilters,
    getSearchParams
  };
};
