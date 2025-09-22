# 🔐 CỤM 1: AUTHENTICATION & USER MANAGEMENT - FRONTEND GUIDE

## 📋 **TỔNG QUAN**

Cụm 1 bao gồm toàn bộ hệ thống xác thực và quản lý người dùng cho frontend, từ đăng ký, đăng nhập đến quản lý profile.

## 🗂️ **CẤU TRÚC FILES**

```
frontend/src/
├── components/
│   ├── Form/
│   │   ├── Input.js                 # Input component tái sử dụng
│   │   ├── Button.js                # Button component
│   │   ├── FormError.js             # Error message component
│   │   └── PasswordInput.js         # Password input với show/hide
│   ├── Common/
│   │   ├── LoadingSpinner.js        # Loading animation
│   │   ├── ErrorMessage.js          # Error display component
│   │   └── SuccessMessage.js        # Success message component
│   └── Auth/
│       ├── LoginForm.js             # Login form component
│       ├── RegisterForm.js          # Register form component
│       ├── ProfileForm.js           # Profile update form
│       ├── ChangePasswordForm.js    # Change password form
│       └── ProtectedRoute.js        # Route protection
├── contexts/
│   └── AuthContext.js               # Authentication context
├── pages/
│   ├── Login.js                     # Login page
│   ├── Register.js                  # Register page
│   └── Profile.js                   # Profile management page
├── hooks/
│   ├── useAuth.js                   # Authentication hook
│   ├── useLocalStorage.js           # LocalStorage hook
│   └── useApiCall.js                # API call hook
├── services/
│   └── authService.js               # Authentication API calls
└── utils/
    ├── validation.js                # Form validation utilities
    └── authHelpers.js               # Authentication helper functions
```

## 🔑 **API ENDPOINTS SUMMARY**

### **Authentication APIs:**
```javascript
// Base URL: http://localhost:5000/api

const AUTH_ENDPOINTS = {
  register: 'POST /customers/register',
  login: 'POST /customers/login', 
  logout: 'POST /customers/logout',
  getProfile: 'GET /customers/profile',
  updateProfile: 'PUT /customers/profile',
  changePassword: 'PUT /customers/change-password'
};
```

## 📝 **COMPONENTS SPECIFICATIONS**

### **1. Form Components**

#### **Input.js**
```javascript
// Props:
{
  type: 'text' | 'email' | 'password' | 'tel' | 'date',
  name: string,
  label: string,
  placeholder: string,
  value: string,
  onChange: function,
  error: string,
  required: boolean,
  disabled: boolean,
  icon: ReactComponent,
  className: string
}

// Usage:
<Input 
  type="email"
  name="email"
  label="Email"
  placeholder="Nhập email của bạn"
  value={email}
  onChange={handleChange}
  error={errors.email}
  required
/>
```

#### **Button.js**
```javascript
// Props:
{
  type: 'button' | 'submit' | 'reset',
  variant: 'primary' | 'secondary' | 'danger' | 'outline',
  size: 'sm' | 'md' | 'lg',
  loading: boolean,
  disabled: boolean,
  onClick: function,
  children: ReactNode,
  className: string,
  icon: ReactComponent
}

// Usage:
<Button 
  type="submit"
  variant="primary"
  loading={isSubmitting}
  disabled={!isValid}
>
  Đăng nhập
</Button>
```

#### **PasswordInput.js**
```javascript
// Props: Extends Input props +
{
  showToggle: boolean,
  strength: boolean // Show password strength indicator
}

// Features:
- Show/hide password toggle
- Password strength indicator
- Auto-validation
```

### **2. Auth Forms**

#### **LoginForm.js**
```javascript
// Props:
{
  onSubmit: function,
  loading: boolean,
  error: string,
  initialValues: object
}

// Fields:
- email (required, email validation)
- password (required, min 6 chars)
- rememberMe (optional, checkbox)

// Validation:
- Email format validation
- Password minimum length
- Required field validation
```

#### **RegisterForm.js**
```javascript
// Props:
{
  onSubmit: function,
  loading: boolean,
  error: string
}

// Fields:
- full_name (required, min 2 chars)
- email (required, email validation, unique check)
- phone (required, phone format)
- password (required, min 6 chars, strength check)
- confirm_password (required, match password)
- date_of_birth (optional, age validation)
- gender (optional, select)
- terms_accepted (required, checkbox)

// Validation:
- All required fields
- Email format and uniqueness
- Phone number format (Vietnamese)
- Password strength requirements
- Password confirmation match
- Age validation (18+)
- Terms acceptance
```

#### **ProfileForm.js**
```javascript
// Props:
{
  user: object,
  onSubmit: function,
  loading: boolean,
  error: string
}

// Fields:
- full_name (required)
- email (required, readonly)
- phone (required)
- date_of_birth (optional)
- gender (optional)
- address (optional, textarea)
- profile_image (optional, file upload)

// Features:
- Pre-filled with user data
- Image upload preview
- Real-time validation
- Dirty form detection
```

## 🔧 **SERVICES & API CALLS**

### **authService.js**
```javascript
import api from './api';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils';
import { STORAGE_KEYS } from '../constants';

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/customers/register', userData);
    const { customer, token } = response.data.data;
    
    // Store token and user data
    setStorageItem(STORAGE_KEYS.AUTH_TOKEN, token);
    setStorageItem(STORAGE_KEYS.USER_DATA, customer);
    
    return { customer, token };
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/customers/login', credentials);
    const { customer, token } = response.data.data;
    
    // Store token and user data
    setStorageItem(STORAGE_KEYS.AUTH_TOKEN, token);
    setStorageItem(STORAGE_KEYS.USER_DATA, customer);
    
    // Handle remember me
    if (credentials.rememberMe) {
      setStorageItem(STORAGE_KEYS.REMEMBER_ME, true);
    }
    
    return { customer, token };
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/customers/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear all stored data
      removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
      removeStorageItem(STORAGE_KEYS.USER_DATA);
      removeStorageItem(STORAGE_KEYS.REMEMBER_ME);
    }
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/customers/profile');
    const customer = response.data.data.customer;
    
    // Update stored user data
    setStorageItem(STORAGE_KEYS.USER_DATA, customer);
    
    return customer;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/customers/profile', profileData);
    const customer = response.data.data.customer;
    
    // Update stored user data
    setStorageItem(STORAGE_KEYS.USER_DATA, customer);
    
    return customer;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/customers/change-password', passwordData);
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = getStorageItem(STORAGE_KEYS.AUTH_TOKEN);
    const user = getStorageItem(STORAGE_KEYS.USER_DATA);
    return !!(token && user);
  },

  // Get current user from storage
  getCurrentUser: () => {
    return getStorageItem(STORAGE_KEYS.USER_DATA);
  },

  // Get auth token from storage
  getToken: () => {
    return getStorageItem(STORAGE_KEYS.AUTH_TOKEN);
  }
};
```

## 🎯 **CONTEXT & HOOKS**

### **Enhanced AuthContext.js**
```javascript
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';

// Auth state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Auth actions
const authActions = {
  INIT_AUTH: 'INIT_AUTH',
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case authActions.INIT_AUTH:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!(action.payload.user && action.payload.token),
        isLoading: false
      };
    
    case authActions.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case authActions.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    
    case authActions.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error
      };
    
    case authActions.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        error: null
      };
    
    case authActions.UPDATE_PROFILE:
      return {
        ...state,
        user: action.payload.user
      };
    
    case authActions.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

// Context methods
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = () => {
      const user = authService.getCurrentUser();
      const token = authService.getToken();
      
      dispatch({
        type: authActions.INIT_AUTH,
        payload: { user, token }
      });
    };

    initAuth();
  }, []);

  // Auth methods
  const login = async (credentials) => {
    dispatch({ type: authActions.LOGIN_START });
    
    try {
      const { customer, token } = await authService.login(credentials);
      
      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: { user: customer, token }
      });
      
      toast.success('Đăng nhập thành công!');
      return { success: true, user: customer };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại';
      
      dispatch({
        type: authActions.LOGIN_FAILURE,
        payload: { error: errorMessage }
      });
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    dispatch({ type: authActions.LOGIN_START });
    
    try {
      const { customer, token } = await authService.register(userData);
      
      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: { user: customer, token }
      });
      
      toast.success('Đăng ký thành công!');
      return { success: true, user: customer };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đăng ký thất bại';
      
      dispatch({
        type: authActions.LOGIN_FAILURE,
        payload: { error: errorMessage }
      });
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    await authService.logout();
    dispatch({ type: authActions.LOGOUT });
    toast.success('Đăng xuất thành công!');
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      
      dispatch({
        type: authActions.UPDATE_PROFILE,
        payload: { user: updatedUser }
      });
      
      toast.success('Cập nhật thông tin thành công!');
      return { success: true, user: updatedUser };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Cập nhật thất bại';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await authService.changePassword(passwordData);
      toast.success('Đổi mật khẩu thành công!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đổi mật khẩu thất bại';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    dispatch({ type: authActions.CLEAR_ERROR });
  };

  const value = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    
    // Methods
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 📋 **VALIDATION RULES**

### **validation.js**
```javascript
import config from '../config/config';

export const validationRules = {
  // Email validation
  email: {
    required: 'Email là bắt buộc',
    pattern: {
      value: config.validation.email.pattern,
      message: config.validation.email.message
    }
  },

  // Password validation
  password: {
    required: 'Mật khẩu là bắt buộc',
    minLength: {
      value: config.validation.password.minLength,
      message: `Mật khẩu phải có ít nhất ${config.validation.password.minLength} ký tự`
    }
  },

  // Confirm password validation
  confirmPassword: (watchPassword) => ({
    required: 'Xác nhận mật khẩu là bắt buộc',
    validate: (value) => value === watchPassword || 'Mật khẩu xác nhận không khớp'
  }),

  // Phone validation
  phone: {
    required: 'Số điện thoại là bắt buộc',
    pattern: {
      value: config.validation.phone.pattern,
      message: config.validation.phone.message
    }
  },

  // Full name validation
  fullName: {
    required: 'Họ tên là bắt buộc',
    minLength: {
      value: 2,
      message: 'Họ tên phải có ít nhất 2 ký tự'
    },
    maxLength: {
      value: 50,
      message: 'Họ tên không được quá 50 ký tự'
    }
  },

  // Date of birth validation
  dateOfBirth: {
    validate: (value) => {
      if (!value) return true; // Optional field
      
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18) {
        return 'Bạn phải từ 18 tuổi trở lên';
      }
      
      return true;
    }
  }
};
```

## 🎨 **STYLING GUIDELINES**

### **CSS Classes Structure**
```css
/* Form Styles */
.form-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.15s ease-in-out;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error {
  border-color: #ef4444;
}

.form-error {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #ef4444;
}

/* Button Styles */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-loading {
  position: relative;
}

.btn-loading::after {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

## 📱 **RESPONSIVE DESIGN**

### **Mobile-First Approach**
```css
/* Mobile (default) */
.form-container {
  padding: 1rem;
  margin: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .form-container {
    padding: 2rem;
    margin: 2rem auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .form-container {
    max-width: 500px;
  }
}
```

## 🔒 **SECURITY CONSIDERATIONS**

### **Frontend Security Measures:**
1. **Input Sanitization**: All inputs are validated and sanitized
2. **XSS Prevention**: Proper escaping of user inputs
3. **Token Storage**: Secure token storage in localStorage
4. **Auto-logout**: Token expiration handling
5. **CSRF Protection**: CSRF tokens for sensitive operations

### **Password Security:**
```javascript
// Password strength checker
export const checkPasswordStrength = (password) => {
  const strength = {
    score: 0,
    feedback: []
  };

  if (password.length >= 8) strength.score += 1;
  if (/[a-z]/.test(password)) strength.score += 1;
  if (/[A-Z]/.test(password)) strength.score += 1;
  if (/[0-9]/.test(password)) strength.score += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength.score += 1;

  if (strength.score < 3) {
    strength.feedback.push('Mật khẩu yếu');
  } else if (strength.score < 4) {
    strength.feedback.push('Mật khẩu trung bình');
  } else {
    strength.feedback.push('Mật khẩu mạnh');
  }

  return strength;
};
```

## 🧪 **TESTING SPECIFICATIONS**

### **Unit Tests:**
```javascript
// Example test for Login component
describe('Login Component', () => {
  test('should render login form', () => {
    render(<Login />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('should show validation errors', async () => {
    render(<Login />);
    fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/email là bắt buộc/i)).toBeInTheDocument();
    });
  });

  test('should call login function on valid submit', async () => {
    const mockLogin = jest.fn();
    render(<Login onLogin={mockLogin} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });
});
```

## 🚀 **DEPLOYMENT CHECKLIST**

### **Pre-deployment:**
- [ ] All forms properly validated
- [ ] Error handling implemented
- [ ] Loading states working
- [ ] Responsive design tested
- [ ] Accessibility features added
- [ ] Performance optimized
- [ ] Security measures in place

### **Environment Variables:**
```bash
# Frontend .env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_ENABLE_DEV_TOOLS=true
REACT_APP_APP_NAME=Homestay Management System
```

## 📊 **PERFORMANCE OPTIMIZATION**

### **Code Splitting:**
```javascript
// Lazy load auth pages
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Profile = lazy(() => import('../pages/Profile'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/profile" element={<Profile />} />
  </Routes>
</Suspense>
```

### **Memoization:**
```javascript
// Memoize expensive calculations
const MemoizedProfileForm = memo(ProfileForm);

// Memoize callback functions
const handleSubmit = useCallback((data) => {
  // Submit logic
}, [dependencies]);
```

## 📋 **IMPLEMENTATION CHECKLIST**

### **Backend Dependencies (Already Done):**
- [x] Customer model and controller
- [x] Authentication middleware
- [x] JWT token handling
- [x] Password hashing
- [x] Input validation
- [x] Error handling

### **Frontend Implementation:**
- [ ] Install required packages
- [ ] Create form components
- [ ] Implement AuthContext
- [ ] Build authentication pages
- [ ] Add validation utilities
- [ ] Implement routing
- [ ] Add styling
- [ ] Test all functionality

### **Required NPM Packages:**
```json
{
  "dependencies": {
    "react-hook-form": "^7.46.1",
    "react-router-dom": "^6.15.0",
    "react-toastify": "^9.1.3",
    "axios": "^1.5.0"
  },
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3"
  }
}
```

---

## 🎯 **NEXT STEPS**

1. **Implement all components** theo specifications trên
2. **Test thoroughly** với real API
3. **Optimize performance** và accessibility
4. **Add error boundaries** và fallbacks
5. **Integrate với other cụm** (Room Management, Booking, etc.)

**CỤM 1 AUTHENTICATION READY TO IMPLEMENT! 🚀**


