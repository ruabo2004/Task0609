import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const customerAPI = {
  
  register: (userData) => api.post('/customers/register', userData),
  login: (credentials) => api.post('/customers/login', credentials),

  getProfile: () => api.get('/customers/profile'),
  updateProfile: (profileData) => api.put('/customers/profile', profileData),
  changePassword: (passwordData) => api.put('/customers/change-password', passwordData),

  getBookingHistory: () => api.get('/customers/booking-history'),
  getReviews: () => api.get('/customers/reviews'),

  deactivateAccount: () => api.delete('/customers/deactivate'),
};

export const roomAPI = {
  
  getAllRooms: () => api.get('/rooms'),
  getRoomById: (roomId) => api.get(`/rooms/${roomId}`),
  getRoomTypes: () => api.get('/rooms/types'),
  getRoomsByType: (roomTypeId) => api.get(`/rooms/type/${roomTypeId}`),

  getAvailableRooms: (checkInDate, checkOutDate) => 
    api.get('/rooms/available', {
      params: { checkInDate, checkOutDate }
    }),
  searchRooms: (filters) => 
    api.get('/rooms/search', { params: filters }),
  checkAvailability: (roomId, checkInDate, checkOutDate) =>
    api.get(`/rooms/${roomId}/availability`, {
      params: { checkInDate, checkOutDate }
    }),
};

export const bookingAPI = {
  
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getBookingById: (bookingId) => api.get(`/bookings/${bookingId}`),
  getCustomerBookings: (params = ) => api.get('/bookings', { params }),
  cancelBooking: (bookingId) => api.put(`/bookings/${bookingId}/cancel`),

  calculateBookingCost: (bookingData) => api.post('/bookings/calculate-cost', bookingData),
};

export const paymentAPI = {
  
  createMoMoPayment: (bookingData) => api.post('/payment/momo/create', bookingData),
  getPaymentStatus: (paymentId) => api.get(`/payment/${paymentId}`),
  getCustomerPayments: (params = ) => api.get('/payment/customer', { params }),
  queryMoMoPaymentStatus: (paymentId) => api.get(`/payment/${paymentId}/momo/query`),
};

export const servicesAPI = {
  getAllServices: () => api.get('/services'),
  getServicesByType: (type) => api.get(`/services/type/${type}`),
};

export default api;
