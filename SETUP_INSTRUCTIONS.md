# 🚀 HOMESTAY MANAGEMENT SYSTEM - SETUP INSTRUCTIONS

## 📋 **SYSTEM REQUIREMENTS**

- **Node.js**: >= 16.0.0
- **MySQL**: >= 8.0
- **NPM**: >= 8.0.0
- **Git**: Latest version

## 🔧 **INSTALLATION STEPS**

### **1. Clone Repository**
```bash
git clone <repository-url>
cd Task0609
```

### **2. Database Setup**
```bash
# Tạo database và tables
mysql -u root -p < create_database.sql

# Thêm dữ liệu mẫu
mysql -u root -p < sample_data.sql
```

### **3. Backend Setup**
```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Update .env with your configuration
# Đặc biệt chú ý:
# - DB_PASSWORD=Viettit2004@
# - DB_NAME=task0609
# - JWT_SECRET=your-secret-key

# Start development server
npm run dev
```

**Backend sẽ chạy tại: http://localhost:5000**

### **4. Frontend Setup**
```bash
cd frontend

# Install dependencies  
npm install

# Start development server
npm start
```

**Frontend sẽ chạy tại: http://localhost:3000**

## ✅ **VERIFICATION**

### **1. Check Backend**
```bash
# Health check
curl http://localhost:5000/health

# Expected response:
{
  "success": true,
  "message": "Homestay Management System API is running",
  "timestamp": "2025-01-XX...",
  "environment": "development"
}
```

### **2. Check Database**
```sql
USE task0609;
SHOW TABLES;
SELECT COUNT(*) FROM customers;
SELECT COUNT(*) FROM rooms;
```

### **3. Check Frontend**
- Mở http://localhost:3000
- Kiểm tra trang chủ load được
- Test đăng ký/đăng nhập

## 🗂️ **PROJECT STRUCTURE**

```
Task0609/
├── backend/                 # Backend API
│   ├── config/             # Cấu hình database, app
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth, validation, etc.
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # External services (MoMo)
│   ├── env.example        # Environment template
│   ├── package.json       # Dependencies & scripts
│   └── server.js          # Main server file
│
├── frontend/               # React Frontend  
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   ├── config/        # App configuration
│   │   ├── constants/     # Constants & enums
│   │   ├── utils/         # Utility functions
│   │   └── App.js         # Main app component
│   └── package.json       # Dependencies & scripts
│
├── create_database.sql     # Database schema
├── sample_data.sql         # Sample data
├── API_DOCUMENTATION.md    # API documentation
└── SETUP_INSTRUCTIONS.md   # This file
```

## 🎯 **CỤM CHỨC NĂNG ĐÃ HOÀN THÀNH**

### ✅ **Cụm 6: System Configuration**

#### **Backend Configuration:**
- ✅ `backend/config/config.js` - Centralized configuration
- ✅ `backend/env.example` - Environment template
- ✅ `backend/server.js` - Enhanced with middleware & error handling
- ✅ Enhanced package.json scripts

#### **Frontend Configuration:**
- ✅ `frontend/src/config/config.js` - App configuration
- ✅ `frontend/src/constants/index.js` - API endpoints & constants
- ✅ `frontend/src/utils/index.js` - Utility functions
- ✅ Enhanced package.json scripts

#### **Documentation:**
- ✅ `API_DOCUMENTATION.md` - Complete API guide
- ✅ `SETUP_INSTRUCTIONS.md` - Setup instructions

## 🔧 **AVAILABLE SCRIPTS**

### **Backend Scripts:**
```bash
npm start          # Production server
npm run dev        # Development with nodemon
npm test           # Run tests
npm run db:migrate # Create database & tables
npm run db:seed    # Add sample data
npm run db:reset   # Reset database completely
npm run lint       # Check code style
npm run clean      # Clean install
```

### **Frontend Scripts:**
```bash
npm start          # Development server
npm run build      # Production build
npm test           # Run tests
npm run lint       # Check code style
npm run format     # Format code with prettier
npm run preview    # Preview production build
npm run clean      # Clean install
```

## 🔑 **DEFAULT ACCOUNTS**

### **Test Customers:**
```
Email: nguyenvanan@email.com
Password: password123

Email: tranthibinh@email.com  
Password: password123

Email: leminhcuong@email.com
Password: password123
```

## 💳 **PAYMENT TESTING**

### **MoMo Test Credentials:**
```
Partner Code: MOMOBKUN20180529
Access Key: klm05TvNBzhg7h7j
Secret Key: at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa
Environment: Sandbox/Test
```

## 🐛 **TROUBLESHOOTING**

### **Common Issues:**

#### **1. Database Connection Error**
```bash
# Check MySQL service
sudo systemctl status mysql

# Check credentials in .env
DB_PASSWORD=Viettit2004@
DB_NAME=task0609
```

#### **2. Port Already in Use**
```bash
# Kill process on port 5000
npx kill-port 5000

# Kill process on port 3000  
npx kill-port 3000
```

#### **3. Module Not Found**
```bash
# Clean install
npm run clean

# Or manually
rm -rf node_modules package-lock.json
npm install
```

#### **4. JWT Token Issues**
- Check JWT_SECRET in backend/.env
- Clear localStorage in browser
- Re-login to get new token

## 📊 **API TESTING**

### **Postman Collection:**
Import API_DOCUMENTATION.md vào Postman để test APIs

### **Sample API Calls:**
```bash
# Health check
curl http://localhost:5000/health

# Register new customer
curl -X POST http://localhost:5000/api/customers/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com", 
    "password": "password123",
    "confirm_password": "password123",
    "phone": "0909123456"
  }'

# Get rooms
curl http://localhost:5000/api/rooms?page=1&limit=5
```

## 🚀 **NEXT STEPS**

Sau khi setup xong, bạn có thể:

1. **Test toàn bộ hệ thống** với dữ liệu mẫu
2. **Tích hợp frontend** theo API documentation
3. **Phát triển các cụm chức năng khác**:
   - Cụm 1: Authentication & User Management
   - Cụm 2: Room Management  
   - Cụm 3: Booking System
   - Cụm 4: Payment Integration
   - Cụm 5: UI/UX Enhancement

## 📞 **SUPPORT**

Nếu gặp vấn đề trong quá trình setup:

1. Check logs trong terminal
2. Kiểm tra database connection
3. Verify environment variables
4. Clear cache và restart services

**System Configuration hoàn tất! Ready để phát triển các chức năng tiếp theo! 🎉**


