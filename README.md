Stop-Process -Name node -Force
D:\project\Task0609\stop-all.bat

# 🏡 HOMESTAY MANAGEMENT SYSTEM

Hệ thống quản lý vận hành Homestay với Backend Node.js + Express + MySQL và Frontend React + Vite + Tailwind CSS.

## 📋 MỤC LỤC

- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt và chạy dự án](#cài-đặt-và-chạy-dự-án)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Tiến độ phát triển](#tiến-độ-phát-triển)

## 🔧 YÊU CẦU HỆ THỐNG

- **Node.js** >= 16.0.0
- **MySQL** >= 8.0
- **npm** >= 8.0.0
- **Git**

## 🚀 CÀI ĐẶT VÀ CHẠY DỰ ÁN

### 1. Clone repository

```bash
git clone <repository-url>
cd homestay-management
```

### 2. Setup Database

```bash
# Đăng nhập MySQL
mysql -u root -p

# Tạo database và import schema
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 3. Setup Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Copy file cấu hình môi trường
cp env.example .env

# Chỉnh sửa file .env với thông tin database của bạn
# DB_PASSWORD=your_mysql_password
# JWT_SECRET=your_secret_key

# Chạy server development
npm run dev
```

Backend sẽ chạy tại: **http://localhost:5000**

### 4. Kiểm tra Backend

Mở trình duyệt và truy cập:

- Health Check: http://localhost:5000/health
- API Info: http://localhost:5000/api

### 5. Setup Frontend (Sẽ thực hiện ở Tuần 5)

```bash
# Di chuyển vào thư mục frontend (chưa tạo)
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

## 📁 CẤU TRÚC DỰ ÁN

```
homestay-management/
├── backend/                 # Node.js + Express API
│   ├── config/             # Database configuration
│   │   └── database.js
│   ├── controllers/        # Route controllers (Tuần 3-4)
│   ├── middleware/         # Express middleware
│   │   ├── errorHandler.js
│   │   └── notFound.js
│   ├── models/            # Database models (Tuần 3-4)
│   ├── routes/            # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── rooms.js
│   │   ├── bookings.js
│   │   ├── payments.js
│   │   ├── services.js
│   │   └── reports.js
│   ├── utils/             # Utility functions (Tuần 3-4)
│   ├── tests/             # Test files (Tuần 4)
│   ├── uploads/           # File uploads directory
│   ├── package.json
│   ├── server.js          # Entry point
│   └── env.example        # Environment variables template
├── database/              # SQL scripts
│   ├── schema.sql        # Database schema
│   └── seed.sql          # Sample data
├── frontend/              # React + Vite (Tuần 5-6)
├── docs/                  # Documentation
└── README.md
```

## 📡 API ENDPOINTS

### 🔐 Authentication

```
POST   /api/auth/register     # Đăng ký (Tuần 3)
POST   /api/auth/login        # Đăng nhập (Tuần 3)
POST   /api/auth/refresh      # Refresh token (Tuần 3)
POST   /api/auth/logout       # Đăng xuất (Tuần 3)
```

### 👥 Users

```
GET    /api/users/profile     # Lấy profile user (Tuần 3)
PUT    /api/users/profile     # Cập nhật profile (Tuần 3)
GET    /api/users             # Lấy danh sách users (Admin) (Tuần 3)
POST   /api/users             # Tạo user mới (Admin) (Tuần 3)
PUT    /api/users/:id         # Cập nhật user (Admin) (Tuần 3)
DELETE /api/users/:id         # Xóa user (Admin) (Tuần 3)
```

### 🏠 Rooms

```
GET    /api/rooms                    # Lấy danh sách phòng (Tuần 3)
GET    /api/rooms/:id               # Chi tiết phòng (Tuần 3)
GET    /api/rooms/search/available  # Tìm phòng trống (Tuần 4)
POST   /api/rooms                   # Tạo phòng (Admin) (Tuần 3)
PUT    /api/rooms/:id               # Cập nhật phòng (Admin) (Tuần 3)
DELETE /api/rooms/:id               # Xóa phòng (Admin) (Tuần 3)
```

### 📅 Bookings

```
GET    /api/bookings        # Danh sách đặt phòng (Tuần 4)
GET    /api/bookings/:id    # Chi tiết đặt phòng (Tuần 4)
POST   /api/bookings        # Tạo đặt phòng (Tuần 4)
PUT    /api/bookings/:id    # Cập nhật đặt phòng (Tuần 4)
DELETE /api/bookings/:id    # Hủy đặt phòng (Tuần 4)
```

### 💳 Payments

```
POST   /api/payments/create        # Tạo thanh toán (Tuần 4)
POST   /api/payments/vnpay/return  # VNPay callback (Tuần 4)
GET    /api/payments/:id           # Chi tiết thanh toán (Tuần 4)
```

### 🛎 Services

```
GET    /api/services        # Danh sách dịch vụ (Tuần 4)
POST   /api/services        # Tạo dịch vụ (Admin) (Tuần 4)
PUT    /api/services/:id    # Cập nhật dịch vụ (Admin) (Tuần 4)
DELETE /api/services/:id    # Xóa dịch vụ (Admin) (Tuần 4)
```

### 📊 Reports

```
GET    /api/reports/revenue     # Báo cáo doanh thu (Tuần 4)
GET    /api/reports/occupancy   # Tỷ lệ lấp đầy phòng (Tuần 4)
GET    /api/reports/bookings    # Thống kê đặt phòng (Tuần 4)
```

## 🗄 DATABASE SCHEMA

### Các bảng chính:

- **users** - Thông tin người dùng (khách hàng, nhân viên, admin)
- **rooms** - Thông tin phòng homestay
- **bookings** - Đơn đặt phòng
- **payments** - Thanh toán
- **services** - Dịch vụ bổ sung
- **booking_services** - Dịch vụ đặt kèm
- **reviews** - Đánh giá của khách hàng
- **staff_reports** - Báo cáo nhân viên

### Sample Data:

- 1 Admin user: `admin@homestay.com` / `admin123`
- 2 Staff users: `staff1@homestay.com` / `staff123`
- 4 Customer users: `customer1@gmail.com` / `customer123`
- 10 Rooms với các loại khác nhau
- 15+ Services (food, tour, transport, other)
- Sample bookings và payments

## 🛠 CÔNG NGHỆ SỬ DỤNG

### Backend:

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **express-validator** - Input validation
- **helmet** - Security middleware
- **cors** - CORS handling
- **morgan** - HTTP logging
- **multer** - File upload

### Frontend (Tuần 5-6):

- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling

### Database:

- **MySQL** - Relational database
- **Stored Procedures** - Complex queries
- **Views** - Reporting queries
- **Triggers** - Auto-update room status

## 📈 TIẾN ĐỘ PHÁT TRIỂN

### ✅ Tuần 2: THIẾT KẾ CSDL - SETUP BACKEND (HOÀN THÀNH)

- [x] Thiết kế cơ sở dữ liệu MySQL và tạo ERD
- [x] Tạo database schema và seed data
- [x] Setup môi trường phát triển Backend (Node.js + Express)
- [x] Tạo project structure và cài đặt dependencies
- [x] Setup basic Express server với middleware cơ bản

### 🔄 Tuần 3: PHÁT TRIỂN BACKEND API (PHASE 1) - ĐANG THỰC HIỆN

- [ ] Implement authentication system (JWT)
- [ ] Tạo API endpoints cho User management
- [ ] Tạo API endpoints cho Room management
- [ ] Implement middleware (auth, validation, error handling)
- [ ] Test APIs với Postman

### ⏳ Tuần 4: PHÁT TRIỂN BACKEND API (PHASE 2)

- [ ] Tạo API endpoints cho Booking management
- [ ] Tạo API endpoints cho Payment system
- [ ] Tạo API endpoints cho Service management
- [ ] Tạo API endpoints cho Reports & Analytics
- [ ] Hoàn thiện backend testing và documentation

### ⏳ Tuần 5: PHÁT TRIỂN FRONTEND

- [ ] Setup React + Vite + Tailwind project
- [ ] Thiết kế wireframe/mockup giao diện
- [ ] Implement authentication pages (login/register)
- [ ] Tạo layout chính và navigation
- [ ] Tích hợp Frontend với Backend APIs

### ⏳ Tuần 6: HOÀN THIỆN FRONTEND & DEPLOYMENT

- [ ] Hoàn thiện tất cả pages và components
- [ ] Implement responsive design và UX
- [ ] Testing end-to-end
- [ ] Deploy ứng dụng
- [ ] Viết báo cáo và tạo video demo

## 🧪 TESTING

```bash
# Chạy tests (Tuần 4)
npm test

# Chạy tests với coverage
npm run test:coverage

# Chạy tests trong watch mode
npm run test:watch
```

## 🚀 DEPLOYMENT

### Development:

```bash
# Backend
cd backend && npm run dev

# Frontend (Tuần 5)
cd frontend && npm run dev
```

### Production:

```bash
# Build frontend
cd frontend && npm run build

# Start backend with PM2
pm2 start backend/server.js --name homestay-backend
```

## 📝 GHI CHÚ

- Hiện tại đang hoàn thành **Tuần 2** với việc setup cơ bản backend và database
- Các API endpoints hiện tại chỉ trả về placeholder messages
- Tuần 3 sẽ implement đầy đủ authentication và CRUD operations
- Frontend sẽ được phát triển ở Tuần 5-6

## 📞 HỖ TRỢ

Nếu gặp vấn đề trong quá trình setup:

1. Kiểm tra MySQL service đã chạy
2. Đảm bảo thông tin database trong file `.env` chính xác
3. Kiểm tra port 5000 không bị conflict
4. Xem logs trong terminal để debug

---

**Happy Coding! 🎉**
