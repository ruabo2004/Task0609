import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useLogin } from '@/hooks/useAuth';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardPath } from '@/utils/navigation';

/**
 * LoginPage component for user authentication
 */
const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, getDashboard } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Use login mutation hook
  const { mutate: login, loading: isLoading } = useLogin({
    onSuccess: (data) => {
      // Get redirect path based on user role after successful login
      const userRole = data?.user?.role || 'customer';
      
      // Don't redirect to error pages or auth pages
      const from = location.state?.from;
      const shouldRedirectToFrom = from && 
        !from.startsWith('/auth') && 
        !from.includes('/404') && 
        !from.includes('/unauthorized');
      
      // For customer, always go to homepage. Staff/Admin follow normal rule.
      const redirectPath = userRole === 'customer'
        ? '/'
        : (shouldRedirectToFrom ? from : getDashboardPath(userRole));
      
      console.log('Login redirect debug:', {
        userRole,
        from,
        shouldRedirectToFrom,
        redirectPath,
        locationState: location.state
      });
      
      // Use window.location.href for more reliable redirect
      window.location.href = redirectPath;
    },
  });

  const onSubmit = async (data) => {
    login(data);
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Đăng nhập tài khoản
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Hoặc{' '}
          <Link
            to="/auth/register"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            tạo tài khoản mới
          </Link>
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Email */}
        <div>
          <label htmlFor="email" className="form-label">
            Địa chỉ email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`form-input ${errors.email ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
            placeholder="Nhập email của bạn"
            {...register('email', {
              required: 'Email là bắt buộc',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Vui lòng nhập địa chỉ email hợp lệ',
              },
            })}
          />
          {errors.email && (
            <p className="form-error">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="form-label">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className={`form-input pr-10 ${errors.password ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
              placeholder="Nhập mật khẩu của bạn"
              {...register('password', {
                required: 'Mật khẩu là bắt buộc',
                minLength: {
                  value: 6,
                  message: 'Mật khẩu phải có ít nhất 6 ký tự',
                },
              })}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="form-error">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="form-checkbox"
              {...register('remember')}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Ghi nhớ đăng nhập
            </label>
          </div>

          <div className="text-sm">
            <Link
              to="/auth/forgot-password"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        {/* Submit button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="spinner w-4 h-4 mr-2"></div>
                Đang đăng nhập...
              </div>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </div>
      </form>

      {/* Demo accounts info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Tài khoản Test:</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>Khách hàng:</strong> iezreal.com@gmail.com / Viettit2004@</p>
          <p><strong>Nhân viên:</strong> nhanvien@@gmail.com / password123</p>
          <p><strong>Quản trị:</strong> admin@gmail.com / password123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
