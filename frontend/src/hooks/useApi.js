import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';

/**
 * Generic API hook for data fetching with loading, error states
 * @param {Function} apiCall - API function to call
 * @param {Array} dependencies - Dependencies for re-fetching
 * @param {Object} options - Hook options
 * @returns {Object} { data, loading, error, refetch, mutate }
 */
export const useApi = (apiCall, dependencies = [], options = {}) => {
  const {
    immediate = true,
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall(...args);
      const result = response.data?.data || response.data;
      
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      if (showSuccessToast) {
        toast.success(response.data?.message || 'Operation successful');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'An error occurred';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, onSuccess, onError, showSuccessToast, showErrorToast]);

  // Auto-fetch on mount and dependency changes
  useEffect(() => {
    if (immediate) {
      const fetchDataInternal = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const response = await apiCall();
          const result = response.data?.data || response.data;
          
          setData(result);
          
          if (onSuccess) {
            onSuccess(result);
          }
          
          if (showSuccessToast) {
            toast.success(response.data?.message || 'Operation successful');
          }
        } catch (err) {
          const errorMessage = err.response?.data?.error?.message || err.message || 'An error occurred';
          setError(errorMessage);
          
          if (onError) {
            onError(err);
          }
          
          if (showErrorToast) {
            toast.error(errorMessage);
          }
        } finally {
          setLoading(false);
        }
      };
      
      fetchDataInternal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...dependencies]);

  // Mutate data without API call (optimistic updates)
  const mutate = useCallback((newData) => {
    if (typeof newData === 'function') {
      setData(prevData => newData(prevData));
    } else {
      setData(newData);
    }
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate,
  };
};

/**
 * Hook for API mutations (POST, PUT, DELETE)
 * @param {Function} apiCall - API function to call
 * @param {Object} options - Hook options
 * @returns {Object} { mutate, loading, error, data }
 */
export const useMutation = (apiCall, options = {}) => {
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutate = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall(...args);
      const result = response.data?.data || response.data;
      
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      if (showSuccessToast) {
        toast.success(response.data?.message || 'Operation successful');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'An error occurred';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, onSuccess, onError, showSuccessToast, showErrorToast]);

  return {
    mutate,
    loading,
    error,
    data,
  };
};

/**
 * Hook for paginated data fetching
 * @param {Function} apiCall - API function that accepts pagination params
 * @param {Object} initialParams - Initial pagination parameters
 * @param {Object} options - Hook options
 * @returns {Object} Pagination data and controls
 */
export const usePagination = (apiCall, initialParams = {}, options = {}) => {
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    ...initialParams,
  });

  // Use a custom approach for pagination to preserve full response structure
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiCall(params);
        
        if (!isCancelled) {
          setData(response.data); // Keep full response structure
        }
        
      } catch (err) {
        if (!isCancelled) {
          const errorMessage = err.response?.data?.error?.message || err.message || 'An error occurred';
          setError(errorMessage);
          
          if (options.showErrorToast !== false) {
            toast.error(errorMessage);
          }
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      isCancelled = true;
    };
  }, [JSON.stringify(params), options.showErrorToast]);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall(params);
      setData(response.data);
      
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'An error occurred';
      setError(errorMessage);
      
      if (options.showErrorToast !== false) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [apiCall, params, options.showErrorToast]);

  const setPage = useCallback((page) => {
    setParams(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit) => {
    setParams(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const setFilters = useCallback((filters) => {
    setParams(prev => ({ ...prev, ...filters, page: 1 }));
  }, []);

  const setSorting = useCallback((sort) => {
    setParams(prev => ({ ...prev, sort, page: 1 }));
  }, []);

  // Handle different API response structures
  let extractedData = [];
  let paginationData = {};
  
  if (data?.data?.rooms) {
    // Rooms endpoint with nested structure: { success, data: { rooms: [...], pagination: {...} } }
    extractedData = data.data.rooms;
    paginationData = data.data.pagination || {};
  } else if (data?.rooms) {
    // Direct rooms structure: { rooms: [...], pagination: {...} }
    extractedData = data.rooms;
    paginationData = data.pagination || {};
  } else if (data?.data && Array.isArray(data.data)) {
    // Bookings endpoint with structure: { success, data: [...], pagination }
    extractedData = data.data;
    paginationData = data.pagination || {};
  } else if (Array.isArray(data)) {
    // Direct array response
    extractedData = data;
    paginationData = {};
  } else {
  }

  return {
    data: extractedData,
    pagination: paginationData,
    loading,
    error,
    params,
    setPage,
    setLimit,
    setFilters,
    setSorting,
    refetch,
  };
};

export default useApi;
