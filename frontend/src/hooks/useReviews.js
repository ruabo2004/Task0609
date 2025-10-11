import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';

/**
 * Hook for managing room reviews
 * @param {number} roomId - Room ID to fetch reviews for
 * @param {Object} options - Options for the hook
 * @returns {Object} Reviews data and functions
 */
export const useReviews = (roomId, options = {}) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const {
    immediate = true,
    page = 1,
    limit = 10,
    showErrorToast = true
  } = options;

  const fetchReviews = useCallback(async (roomId, pageNum = 1) => {
    if (!roomId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiService.rooms.getReviews(roomId, {
        page: pageNum,
        limit
      });

      if (response.data && response.data.success) {
        const reviewsData = response.data.data || response.data;
        const paginationData = response.data.pagination || response.data;

        console.log('📝 Reviews API Response:', {
          success: response.data.success,
          reviewsData: reviewsData,
          reviewsLength: Array.isArray(reviewsData) ? reviewsData.length : 'not array',
          pagination: paginationData
        });

        // Ensure we always set an array
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        
        // Update pagination if available
        if (paginationData) {
          setPagination({
            page: paginationData.page || pageNum,
            totalPages: paginationData.totalPages || 1,
            total: paginationData.total || 0
          });
        }
      } else {
        console.error('Reviews API call failed:', response.data?.message || 'Unknown error');
        setReviews([]);
        if (showErrorToast) {
          toast.error('Không thể tải đánh giá');
        }
      }
    } catch (err) {
      console.error('Reviews API Error:', err);
      setError(err.message);
      setReviews([]);
      if (showErrorToast) {
        toast.error('Không thể tải đánh giá');
      }
    } finally {
      setLoading(false);
    }
  }, [limit, showErrorToast]);

  // Auto-fetch when roomId changes
  useEffect(() => {
    if (immediate && roomId) {
      fetchReviews(roomId, page);
    }
  }, [roomId, page, immediate, fetchReviews]);

  const setPage = useCallback((newPage) => {
    if (roomId) {
      fetchReviews(roomId, newPage);
    }
  }, [roomId, fetchReviews]);

  const refetch = useCallback(() => {
    if (roomId) {
      fetchReviews(roomId, pagination.page);
    }
  }, [roomId, pagination.page, fetchReviews]);

  return {
    reviews,
    loading,
    error,
    pagination,
    setPage,
    refetch,
    fetchReviews
  };
};

/**
 * Hook for creating a new review
 * @returns {Object} Review creation functions
 */
export const useCreateReview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createReview = useCallback(async (reviewData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.reviews.create(reviewData);

      if (response.data && response.data.success) {
        toast.success('Đánh giá đã được gửi thành công!');
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Không thể tạo đánh giá');
      }
    } catch (err) {
      console.error('Create review error:', err);
      setError(err.message);
      toast.error(err.response?.data?.message || 'Không thể tạo đánh giá');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createReview,
    loading,
    error
  };
};

/**
 * Hook for getting review statistics
 * @param {number} roomId - Room ID to get stats for
 * @returns {Object} Review statistics
 */
export const useReviewStats = (roomId) => {
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {}
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async (roomId) => {
    if (!roomId) return;

    try {
      setLoading(true);

      // Get reviews to calculate stats
      const response = await apiService.rooms.getReviews(roomId, { limit: 1000 });
      
      if (response.data && response.data.success) {
        const reviews = response.data.data.reviews || response.data.data || [];
        
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          const averageRating = totalRating / reviews.length;
          
          // Calculate rating distribution
          const distribution = {};
          for (let i = 1; i <= 5; i++) {
            distribution[i] = reviews.filter(review => review.rating === i).length;
          }

          setStats({
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
            totalReviews: reviews.length,
            ratingDistribution: distribution
          });
        } else {
          setStats({
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          });
        }
      }
    } catch (err) {
      console.error('Fetch review stats error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (roomId) {
      fetchStats(roomId);
    }
  }, [roomId, fetchStats]);

  return {
    stats,
    loading,
    refetch: () => fetchStats(roomId)
  };
};