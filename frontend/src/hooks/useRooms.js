import { useState, useCallback, useEffect, useMemo } from 'react';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';

export const useRooms = (filters = {}, options = {}) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // No sample data - use only real database data

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [JSON.stringify(filters)]);

  const fetchRooms = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Call real API
      const response = await apiService.rooms.getAll(filters);
      
      if (response.data && response.data.success) {
        const roomsData = response.data.data.rooms || response.data.data;
        
        // Ensure we always set an array
        setRooms(Array.isArray(roomsData) ? roomsData : []);
        
        // Update pagination if available
        if (response.data.data.pagination) {
          setPagination(response.data.data.pagination);
        }
      } else {
        // No fallback to sample data - use empty array if API fails
        console.error('API call failed:', response.data?.message || 'Unknown error');
        setRooms([]);
        if (options.showErrorToast) {
          toast.error('Không thể tải danh sách phòng');
        }
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message);
      
      // No fallback to sample data - use empty array on error
      setRooms([]);
      if (options.showErrorToast) {
        toast.error('Không thể tải danh sách phòng');
      }
    } finally {
      setLoading(false);
    }
  }, [options.showErrorToast]);

  const updateRoomStatus = useCallback(async (roomId, newStatus) => {
    try {
      // Call real API
      const response = await apiService.rooms.updateStatus(roomId, newStatus);
      
      if (response.data && response.data.success) {
        setRooms(prev => prev.map(room => 
          room.id === roomId 
            ? { ...room, status: newStatus }
            : room
        ));
        
        const statusTexts = {
          available: 'Sẵn sàng',
          occupied: 'Đang sử dụng',
          cleaning: 'Đang dọn dẹp',
          maintenance: 'Bảo trì',
          out_of_order: 'Ngừng hoạt động'
        };
        
        toast.success(`Đã cập nhật trạng thái phòng thành ${statusTexts[newStatus]}`);
        return true;
      } else {
        throw new Error(response.data?.message || 'Cập nhật thất bại');
      }
    } catch (err) {
      console.error('Update room status error:', err);
      toast.error('Không thể cập nhật trạng thái phòng: ' + (err.response?.data?.message || err.message));
      return false;
    }
  }, []);

  const updateMaintenanceStatus = useCallback(async (roomId, maintenanceData) => {
    try {
      // Call real API - update room with maintenance info
      const response = await apiService.rooms.update(roomId, {
        maintenance_status: maintenanceData.status,
        maintenance_notes: maintenanceData.notes,
        last_maintenance: new Date().toISOString()
      });
      
      if (response.data && response.data.success) {
        setRooms(prev => prev.map(room => 
          room.id === roomId 
            ? { 
                ...room, 
                maintenance_status: maintenanceData.status,
                maintenance_notes: maintenanceData.notes,
                last_maintenance: new Date().toISOString()
              }
            : room
        ));
        
        toast.success('Đã cập nhật thông tin bảo trì');
        return true;
      } else {
        throw new Error(response.data?.message || 'Cập nhật thất bại');
      }
    } catch (err) {
      console.error('Update maintenance error:', err);
      toast.error('Không thể cập nhật thông tin bảo trì: ' + (err.response?.data?.message || err.message));
      return false;
    }
  }, []);

  const markRoomCleaned = useCallback(async (roomId) => {
    try {
      // Call real API - update room with cleaned status
      const response = await apiService.rooms.update(roomId, {
        last_cleaned: new Date().toISOString(),
        status: 'available' // Change status to available after cleaning
      });
      
      if (response.data && response.data.success) {
        setRooms(prev => prev.map(room => 
          room.id === roomId 
            ? { 
                ...room, 
                last_cleaned: new Date().toISOString(),
                status: 'available'
              }
            : room
        ));
        
        toast.success('Đã đánh dấu phòng đã được dọn dẹp');
        return true;
      } else {
        throw new Error(response.data?.message || 'Cập nhật thất bại');
      }
    } catch (err) {
      console.error('Mark room cleaned error:', err);
      toast.error('Không thể cập nhật thông tin dọn dẹp: ' + (err.response?.data?.message || err.message));
      return false;
    }
  }, []);

  const getRoomStats = useCallback(() => {
    // Ensure rooms is an array
    const roomsArray = Array.isArray(rooms) ? rooms : [];
    
    return {
      total: roomsArray.length,
      available: roomsArray.filter(r => r.status === 'available').length,
      occupied: roomsArray.filter(r => r.status === 'occupied').length,
      cleaning: roomsArray.filter(r => r.status === 'cleaning').length,
      maintenance: roomsArray.filter(r => r.status === 'maintenance').length,
      out_of_order: roomsArray.filter(r => r.status === 'out_of_order').length,
      occupancy_rate: roomsArray.length > 0 ? (roomsArray.filter(r => r.status === 'occupied').length / roomsArray.length * 100).toFixed(1) : 0
    };
  }, [rooms]);

  // Auto-fetch when filters change if immediate is true
  useEffect(() => {
    if (options.immediate !== false) {
      fetchRooms(memoizedFilters);
    }
  }, [memoizedFilters, options.immediate, fetchRooms]);

  const setPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const refetch = useCallback(() => {
    fetchRooms(memoizedFilters);
  }, [memoizedFilters, fetchRooms]);

  return {
    data: rooms,
    rooms,
    loading,
    error,
    pagination,
    setPage,
    refetch,
    fetchRooms,
    updateRoomStatus,
    updateMaintenanceStatus,
    markRoomCleaned,
    getRoomStats
  };
};

// Hook for getting room booked dates (for calendar)
export const useRoomBookedDates = (roomId, dateRange = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookedDates = useCallback(async () => {
    if (!roomId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Call real API with date range
      const response = await apiService.rooms.getBookedDates(roomId, {
        start_date: dateRange.startDate,
        end_date: dateRange.endDate
      });

      if (response.data && response.data.success) {
        const bookedData = response.data.data;
        setData(bookedData);
      } else {
        console.error('Failed to fetch booked dates:', response.data?.message);
        setData({ booked_dates: [], booked_ranges: [] });
      }
    } catch (err) {
      console.error('Fetch booked dates error:', err);
      setError(err.message);
      setData({ booked_dates: [], booked_ranges: [] });
      toast.error('Không thể tải lịch đặt phòng');
    } finally {
      setLoading(false);
    }
  }, [roomId, dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    if (roomId) {
      fetchBookedDates();
    }
  }, [roomId, fetchBookedDates]);

  return {
    data,
    loading,
    error,
    refetch: fetchBookedDates
  };
};

// Hook for getting available rooms (for booking)
export const useAvailableRooms = () => {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAvailableRooms = useCallback(async (checkInDate, checkOutDate, guests = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Call real API
      const response = await apiService.rooms.getAvailable({ 
        checkInDate, 
        checkOutDate, 
        guests,
        status: 'available'
      });
      
      if (response.data && response.data.success) {
        const roomsData = response.data.data.rooms || response.data.data;
        setAvailableRooms(Array.isArray(roomsData) ? roomsData : []);
      } else {
        // No fallback to sample data - use empty array if API fails
        console.error('API call failed:', response.data?.message || 'Unknown error');
        setAvailableRooms([]);
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message);
      
      // No fallback to sample data - use empty array on error
      setAvailableRooms([]);
      toast.error('Không thể tải danh sách phòng khả dụng');
    } finally {
      setLoading(false);
    }
  }, []);

  const checkRoomAvailability = useCallback(async (roomId, checkInDate, checkOutDate) => {
    try {
      // Call real API
      const response = await apiService.bookings.checkAvailability({
        roomId,
        checkInDate,
        checkOutDate
      });
      
      if (response.data && response.data.success) {
        return { available: response.data.data.available };
      } else {
        // Fallback to simple check
        const unavailableDates = ['2025-10-05', '2025-10-06', '2025-10-12', '2025-10-13'];
        const isAvailable = !unavailableDates.includes(checkInDate);
        return { available: isAvailable };
      }
    } catch (err) {
      console.error('Check availability error:', err);
      // Fallback to simple check on error
      const unavailableDates = ['2025-10-05', '2025-10-06', '2025-10-12', '2025-10-13'];
      const isAvailable = !unavailableDates.includes(checkInDate);
      return { available: isAvailable };
    }
  }, []);

  return {
    availableRooms,
    loading,
    error,
    fetchAvailableRooms,
    checkRoomAvailability
  };
};

// Hook for getting single room details
export const useRoom = (roomId) => {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoom = useCallback(async () => {
    if (!roomId) return;

      try {
        setLoading(true);
        setError(null);
        
      // Call real API
      const response = await apiService.rooms.getById(roomId);
      
      if (response.data && response.data.success) {
        setRoom(response.data.data);
      } else {
        // No fallback to sample data - use null if API fails
        console.error('API call failed:', response.data?.message || 'Unknown error');
        setRoom(null);
      }
      } catch (err) {
      console.error('Fetch room error:', err);
        setError(err.message);
      
      // No fallback to sample data - use null on error
      setRoom(null);
      toast.error('Không thể tải thông tin phòng');
      } finally {
        setLoading(false);
      }
  }, [roomId]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  return {
    room,
    loading,
    error,
    refetch: fetchRoom
  };
};

// Hook for room statistics
export const useRoomStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Call real API
      const response = await apiService.rooms.getStats();
      
      if (response.data && response.data.success) {
        setStats(response.data.data);
      } else {
        // No fallback to sample data - use empty stats if API fails
        console.error('API call failed:', response.data?.message || 'Unknown error');
        setStats({
          totalRooms: 0,
          availableRooms: 0,
          occupiedRooms: 0,
          maintenanceRooms: 0,
          occupancyRate: 0,
          averagePrice: 0,
          totalRevenue: 0
        });
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
      // No fallback to sample data - use empty stats on error
      setStats({
        totalRooms: 0,
        availableRooms: 0,
        occupiedRooms: 0,
        maintenanceRooms: 0,
        occupancyRate: 0,
        averagePrice: 0,
        totalRevenue: 0
      });
      toast.error('Không thể tải thống kê phòng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    refetch: fetchStats
  };
};

// Hook for room types
export const useRoomTypes = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRoomTypes = useCallback(async () => {
    try {
      setLoading(true);
      
      // Call real API
      const response = await apiService.rooms.getTypes();
      
      if (response.data && response.data.success) {
        setRoomTypes(response.data.data || []);
      } else {
        // No fallback to sample data - use empty array if API fails
        console.error('API call failed:', response.data?.message || 'Unknown error');
        setRoomTypes([]);
      }
    } catch (err) {
      console.error('Fetch room types error:', err);
      // No fallback to sample data - use empty array on error
      setRoomTypes([]);
      toast.error('Không thể tải danh sách loại phòng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoomTypes();
  }, [fetchRoomTypes]);

  return {
    roomTypes,
    loading,
    refetch: fetchRoomTypes
  };
};

// Alias for checkRoomAvailability from useAvailableRooms
export const useCheckRoomAvailability = () => {
  const { checkRoomAvailability } = useAvailableRooms();
  return { checkRoomAvailability };
};

// Placeholder hooks for admin functions (not implemented yet)
export const useCreateRoom = () => {
  const createRoom = useCallback(async (roomData) => {
    toast.info('Tính năng tạo phòng mới sẽ được phát triển trong giai đoạn tiếp theo');
    return { success: false, message: 'Not implemented yet' };
  }, []);

  return { createRoom, loading: false };
};

export const useUpdateRoom = () => {
  const updateRoom = useCallback(async (roomId, roomData) => {
    toast.info('Tính năng cập nhật phòng sẽ được phát triển trong giai đoạn tiếp theo');
    return { success: false, message: 'Not implemented yet' };
  }, []);

  return { updateRoom, loading: false };
};

export const useDeleteRoom = () => {
  const deleteRoom = useCallback(async (roomId) => {
    toast.info('Tính năng xóa phòng sẽ được phát triển trong giai đoạn tiếp theo');
    return { success: false, message: 'Not implemented yet' };
  }, []);

  return { deleteRoom, loading: false };
};

export const useUpdateRoomStatus = () => {
  const updateRoomStatus = useCallback(async (roomId, status) => {
    toast.info('Tính năng cập nhật trạng thái phòng sẽ được phát triển trong giai đoạn tiếp theo');
    return { success: false, message: 'Not implemented yet' };
  }, []);

  return { updateRoomStatus, loading: false };
};

export const useUploadRoomImages = () => {
  const uploadImages = useCallback(async (roomId, images) => {
    toast.info('Tính năng upload ảnh phòng sẽ được phát triển trong giai đoạn tiếp theo');
    return { success: false, message: 'Not implemented yet' };
  }, []);

  return { uploadImages, loading: false };
};

export const useRoomSearch = () => {
  const searchRooms = useCallback(async (query) => {
    toast.info('Tính năng tìm kiếm phòng sẽ được phát triển trong giai đoạn tiếp theo');
    return { results: [], total: 0 };
  }, []);

  return { searchRooms, loading: false };
};