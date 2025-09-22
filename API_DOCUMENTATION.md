# 📚 HOMESTAY MANAGEMENT SYSTEM - API DOCUMENTATION

## 🔗 **API BASE URL**
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## 🔑 **AUTHENTICATION**
- **Method**: JWT Token
- **Header**: `Authorization: Bearer <token>`
- **Token Storage**: localStorage với key `homestay_auth_token`

## 📋 **API ENDPOINTS**

### 👥 **CUSTOMER APIs**

#### **1. Đăng ký khách hàng**
```http
POST /api/customers/register
Content-Type: application/json

{
  "full_name": "Nguyễn Văn A",
  "email": "user@example.com",
  "phone": "0901234567",
  "password": "password123",
  "confirm_password": "password123",
  "date_of_birth": "1990-01-01",
  "gender": "male"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "customer": {
      "customer_id": 1,
      "full_name": "Nguyễn Văn A",
      "email": "user@example.com",
      "phone": "0901234567"
    },
    "token": "jwt_token_here"
  }
}
```

#### **2. Đăng nhập**
```http
POST /api/customers/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "remember_me": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "customer": {
      "customer_id": 1,
      "full_name": "Nguyễn Văn A",
      "email": "user@example.com",
      "phone": "0901234567"
    },
    "token": "jwt_token_here"
  }
}
```

#### **3. Lấy thông tin profile**
```http
GET /api/customers/profile
Authorization: Bearer <token>
```

#### **4. Cập nhật profile**
```http
PUT /api/customers/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "Nguyễn Văn A Updated",
  "phone": "0909876543",
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "address": "123 ABC Street"
}
```

#### **5. Đổi mật khẩu**
```http
PUT /api/customers/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "current_password": "old_password",
  "new_password": "new_password",
  "confirm_password": "new_password"
}
```

---

### 🏨 **ROOM APIs**

#### **1. Lấy danh sách phòng**
```http
GET /api/rooms?page=1&limit=10&type_id=1&min_price=500000&max_price=2000000&view_type=sea&status=available
```

**Query Parameters:**
- `page`: Trang hiện tại (default: 1)
- `limit`: Số lượng phòng/trang (default: 10)
- `type_id`: ID loại phòng
- `min_price`: Giá tối thiểu
- `max_price`: Giá tối đa
- `view_type`: Loại view (sea, mountain, city, garden, pool)
- `bed_type`: Loại giường (single, double, queen, king, twin)
- `floor_number`: Tầng
- `status`: Trạng thái phòng (available, occupied, maintenance)

**Response:**
```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "room_id": 1,
        "room_number": "101",
        "room_name": "Standard Garden View",
        "type_name": "Standard Room",
        "price_per_night": 500000,
        "weekend_price": 600000,
        "holiday_price": 700000,
        "view_type": "garden",
        "bed_type": "double",
        "room_size": 25.5,
        "amenities": ["WiFi miễn phí", "Điều hòa", "TV LCD"],
        "images": ["room101_1.jpg", "room101_2.jpg"],
        "status": "available"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

#### **2. Lấy chi tiết phòng**
```http
GET /api/rooms/{room_id}
```

#### **3. Lấy danh sách loại phòng**
```http
GET /api/rooms/types
```

#### **4. Kiểm tra tình trạng phòng**
```http
GET /api/rooms/availability?room_id=1&check_in=2025-01-15&check_out=2025-01-18
```

---

### 📅 **BOOKING APIs**

#### **1. Tạo đặt phòng**
```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "room_id": 1,
  "check_in_date": "2025-01-15",
  "check_out_date": "2025-01-18",
  "num_adults": 2,
  "num_children": 0,
  "special_requests": "Yêu cầu phòng tầng cao",
  "promo_code": "WELCOME2025"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đặt phòng thành công",
  "data": {
    "booking": {
      "booking_id": 1,
      "booking_code": "BK20250115000001",
      "room_id": 1,
      "check_in_date": "2025-01-15",
      "check_out_date": "2025-01-18",
      "total_nights": 3,
      "base_amount": 1500000,
      "tax_amount": 150000,
      "discount_amount": 150000,
      "total_amount": 1500000,
      "booking_status": "pending",
      "payment_status": "pending"
    }
  }
}
```

#### **2. Lấy lịch sử đặt phòng**
```http
GET /api/bookings/customer?page=1&limit=10&status=all
Authorization: Bearer <token>
```

#### **3. Lấy chi tiết đặt phòng**
```http
GET /api/bookings/{booking_id}
Authorization: Bearer <token>
```

#### **4. Hủy đặt phòng**
```http
PUT /api/bookings/{booking_id}/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "cancellation_reason": "Thay đổi kế hoạch"
}
```

---

### 💳 **PAYMENT APIs**

#### **1. Tạo thanh toán MoMo**
```http
POST /api/payment/momo/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "booking_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo thanh toán MoMo thành công",
  "data": {
    "payment_id": 1,
    "momo_pay_url": "https://payment.momo.vn/pay/...",
    "momo_qr_code_url": "https://payment.momo.vn/qr/...",
    "amount": 1500000,
    "order_id": "MOMO_ORDER_123",
    "expires_in": 900
  }
}
```

#### **2. Lấy trạng thái thanh toán**
```http
GET /api/payment/{payment_id}
Authorization: Bearer <token>
```

#### **3. Truy vấn trạng thái MoMo**
```http
GET /api/payment/{payment_id}/momo/query
Authorization: Bearer <token>
```

#### **4. Lấy lịch sử thanh toán**
```http
GET /api/payment/customer?page=1&limit=10
Authorization: Bearer <token>
```

#### **5. MoMo IPN (Webhook)**
```http
POST /api/payment/momo/ipn
Content-Type: application/json

{
  "partnerCode": "MOMOBKUN20180529",
  "orderId": "MOMO_ORDER_123",
  "requestId": "REQUEST_123",
  "amount": 1500000,
  "resultCode": 0,
  "message": "Thành công",
  "transId": "TRANS_123",
  "signature": "signature_here"
}
```

---

### 🎯 **ADDITIONAL SERVICES APIs**

#### **1. Lấy danh sách dịch vụ**
```http
GET /api/services?type=spa&status=active
```

#### **2. Đặt dịch vụ thêm**
```http
POST /api/services/book
Authorization: Bearer <token>
Content-Type: application/json

{
  "booking_id": 1,
  "services": [
    {
      "service_id": 1,
      "quantity": 2,
      "service_date": "2025-01-16",
      "service_time": "19:00"
    }
  ]
}
```

---

### ⭐ **REVIEW APIs**

#### **1. Lấy đánh giá theo phòng**
```http
GET /api/reviews/room/{room_id}?page=1&limit=10
```

#### **2. Tạo đánh giá**
```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "booking_id": 1,
  "room_id": 1,
  "rating": 5,
  "cleanliness_rating": 5,
  "service_rating": 5,
  "location_rating": 4,
  "value_rating": 5,
  "amenities_rating": 4,
  "title": "Trải nghiệm tuyệt vời!",
  "comment": "Phòng sạch sẽ, nhân viên thân thiện...",
  "pros": "Phòng sạch, staff nhiệt tình",
  "cons": "Wifi hơi chậm"
}
```

---

### 🎁 **PROMOCODE APIs**

#### **1. Validate mã khuyến mãi**
```http
POST /api/promocodes/validate
Authorization: Bearer <token>
Content-Type: application/json

{
  "promo_code": "WELCOME2025",
  "booking_amount": 1500000,
  "room_type_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "discount_type": "percentage",
    "discount_value": 10,
    "discount_amount": 150000,
    "final_amount": 1350000,
    "promo_name": "Chào mừng năm mới 2025"
  }
}
```

---

## 🔄 **COMMON RESPONSE FORMATS**

### **Success Response:**
```json
{
  "success": true,
  "message": "Thành công",
  "data": { ... }
}
```

### **Error Response:**
```json
{
  "success": false,
  "message": "Lỗi xảy ra",
  "error": "Chi tiết lỗi"
}
```

### **Validation Error:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Email không hợp lệ"
    }
  ]
}
```

### **Pagination Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## 🚨 **ERROR CODES**

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Dữ liệu không hợp lệ |
| 401 | Unauthorized | Chưa đăng nhập hoặc token hết hạn |
| 403 | Forbidden | Không có quyền truy cập |
| 404 | Not Found | Không tìm thấy resource |
| 409 | Conflict | Dữ liệu đã tồn tại |
| 422 | Validation Error | Lỗi validation |
| 429 | Too Many Requests | Quá nhiều request |
| 500 | Internal Server Error | Lỗi server |

---

## 🔧 **FRONTEND INTEGRATION**

### **1. API Service Setup**
```javascript
// src/services/api.js
import axios from 'axios';
import config from '../config/config';

const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('homestay_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('homestay_auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### **2. API Functions**
```javascript
// Customer API
export const customerAPI = {
  register: (data) => api.post('/customers/register', data),
  login: (data) => api.post('/customers/login', data),
  getProfile: () => api.get('/customers/profile'),
  updateProfile: (data) => api.put('/customers/profile', data),
  changePassword: (data) => api.put('/customers/change-password', data)
};

// Room API
export const roomAPI = {
  getRooms: (params) => api.get('/rooms', { params }),
  getRoomDetail: (id) => api.get(`/rooms/${id}`),
  getRoomTypes: () => api.get('/rooms/types'),
  checkAvailability: (params) => api.get('/rooms/availability', { params })
};

// Booking API
export const bookingAPI = {
  createBooking: (data) => api.post('/bookings', data),
  getBookings: (params) => api.get('/bookings/customer', { params }),
  getBookingDetail: (id) => api.get(`/bookings/${id}`),
  cancelBooking: (id, data) => api.put(`/bookings/${id}/cancel`, data)
};

// Payment API
export const paymentAPI = {
  createMoMoPayment: (data) => api.post('/payment/momo/create', data),
  getPaymentStatus: (id) => api.get(`/payment/${id}`),
  queryMoMoStatus: (id) => api.get(`/payment/${id}/momo/query`),
  getPaymentHistory: (params) => api.get('/payment/customer', { params })
};
```

### **3. React Query Hooks**
```javascript
// src/hooks/useCustomer.js
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { customerAPI } from '../services/api';

export const useCustomerProfile = () => {
  return useQuery('customer-profile', customerAPI.getProfile);
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation(customerAPI.updateProfile, {
    onSuccess: () => {
      queryClient.invalidateQueries('customer-profile');
    }
  });
};

// src/hooks/useRooms.js
export const useRooms = (params) => {
  return useQuery(['rooms', params], () => roomAPI.getRooms(params));
};

export const useRoomDetail = (id) => {
  return useQuery(['room', id], () => roomAPI.getRoomDetail(id));
};
```

---

## 📱 **MOBILE RESPONSIVENESS**

API trả về dữ liệu phù hợp cho cả desktop và mobile. Frontend cần handle:

1. **Responsive Images**: API trả về nhiều sizes ảnh
2. **Pagination**: Adjust page size cho mobile
3. **Touch Events**: Swipe, tap gestures
4. **Loading States**: Skeleton loading cho mobile

---

## 🔐 **SECURITY NOTES**

1. **JWT Token**: Expire sau 24h, cần refresh token mechanism
2. **Rate Limiting**: 100 requests/15 minutes per IP
3. **Input Validation**: Tất cả input đều được validate
4. **SQL Injection**: Sử dụng prepared statements
5. **CORS**: Chỉ allow origin được cấu hình
6. **Headers**: Helmet.js security headers

---

## 🚀 **DEPLOYMENT**

### **Environment Variables:**
```bash
# Backend
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret
MOMO_PARTNER_CODE=your_momo_partner_code

# Frontend
REACT_APP_API_BASE_URL=https://api.yourdomain.com/api
```

### **Build Commands:**
```bash
# Backend
npm install
npm start

# Frontend  
npm install
npm run build
```

---

## 📞 **SUPPORT**

- **Documentation**: Cập nhật liên tục
- **Postman Collection**: Có sẵn để test API
- **Error Handling**: Standardized error responses
- **Logging**: Chi tiết cho debugging

**API này sẵn sàng để frontend team integrate! 🎉**


