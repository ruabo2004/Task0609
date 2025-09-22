# 🏠 Homestay Management System - Frontend

Giao diện người dùng hiện đại cho hệ thống quản lý homestay, được xây dựng với React, Vite và Tailwind CSS.

## ✨ Tính năng

### 🔐 CỤM 1: Authentication & User Management

- ✅ Đăng ký/Đăng nhập với validation đầy đủ
- ✅ Quản lý profile người dùng
- ✅ Đổi mật khẩu với kiểm tra độ mạnh
- ✅ Protected routes và authentication state
- ✅ UI/UX hiện đại với animations
- ✅ Responsive design cho mobile/tablet/desktop

### 🎨 Design System

- ✅ Component library tái sử dụng
- ✅ Consistent styling với Tailwind CSS
- ✅ Loading states và error handling
- ✅ Toast notifications
- ✅ Form validation với react-hook-form

## 🚀 Công nghệ sử dụng

- **React 18** - UI Framework
- **Vite** - Build tool và dev server
- **React Router 6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form state management
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **React Toastify** - Toast notifications

## 📦 Cài đặt

1. **Clone repository**

```bash
git clone <repository-url>
cd frontend
```

2. **Cài đặt dependencies**

```bash
npm install
```

3. **Cấu hình environment**

```bash
cp .env.example .env
```

4. **Khởi chạy development server**

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## 📁 Cấu trúc project

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Form/           # Form components (Input, Button, etc.)
│   │   ├── Common/         # Common components (LoadingSpinner, Toast)
│   │   ├── Auth/           # Authentication components
│   │   └── Layout/         # Layout components
│   ├── pages/              # Page components
│   ├── contexts/           # React contexts
│   ├── services/           # API services
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Utility functions
│   ├── config/             # Configuration files
│   └── assets/             # Static assets
├── public/                 # Public assets
└── package.json
```

## 🛠️ Scripts

```bash
# Development
npm run dev          # Khởi chạy dev server
npm run build        # Build production
npm run preview      # Preview production build

# Testing
npm run test         # Chạy tests
npm run test:ui      # Chạy tests với UI

# Linting
npm run lint         # Kiểm tra code style
npm run lint:fix     # Tự động fix lỗi lint
```

## 📱 Responsive Design

Ứng dụng được thiết kế responsive với breakpoints:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔒 Authentication Flow

1. **Đăng ký**: Tạo tài khoản mới với validation đầy đủ
2. **Đăng nhập**: Xác thực với email/password
3. **JWT Token**: Lưu trữ và quản lý token tự động
4. **Protected Routes**: Bảo vệ các route cần authentication
5. **Auto Logout**: Tự động đăng xuất khi token hết hạn

## 🎨 Component Examples

### Form Components

```jsx
import { Input, Button, PasswordInput } from '@components/Form'

<Input
  type="email"
  name="email"
  label="Email"
  placeholder="Nhập email"
  error={errors.email?.message}
  {...register('email', validationRules.email)}
/>

<PasswordInput
  name="password"
  label="Mật khẩu"
  showStrength
  error={errors.password?.message}
/>
```

### Authentication

```jsx
import { useAuth } from "@contexts/AuthContext";

const { user, login, logout, isAuthenticated } = useAuth();
```

## 🔧 Configuration

### Environment Variables

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_ENABLE_DEV_TOOLS=true
```

### API Configuration

API base URL và timeout được cấu hình trong `src/config/config.js`

## 📋 TODO List

- [x] ✅ Authentication system
- [x] ✅ Form components
- [x] ✅ Routing và navigation
- [x] ✅ Responsive design
- [ ] 🔄 Room management module
- [ ] 🔄 Booking system
- [ ] 🔄 Payment integration
- [ ] 🔄 Admin dashboard

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Team

- **Frontend Development**: React + Tailwind CSS
- **Backend API**: Node.js + Express
- **Database**: MySQL

---

**🎯 CỤM 1 (Authentication) - HOÀN THÀNH! ✅**

Hệ thống authentication đã sẵn sàng với đầy đủ tính năng:

- Đăng ký/Đăng nhập
- Quản lý profile
- Protected routes
- UI/UX hiện đại
- Responsive design
