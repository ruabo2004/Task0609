import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useRegister } from '@/hooks/useAuth';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardPath } from '@/utils/navigation';

/**
 * RegisterPage component for user registration
 */
const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const { getDashboard } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const watchPassword = watch('password');

  // Use register mutation hook
  const { mutate: registerUser, loading: isLoading } = useRegister({
    onSuccess: (data) => {
      // Get redirect path based on user role after successful registration
      const userRole = data?.user?.role || 'customer';
      const redirectPath = getDashboardPath(userRole);
      navigate(redirectPath, { replace: true });
    },
  });

  const onSubmit = async (data) => {
    const userData = {
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      phone: data.phone,
    };
    
    registerUser(userData);
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Tạo tài khoản
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <Link
            to="/auth/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Đăng nhập tại đây
          </Link>
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="form-label">
            Họ và tên
          </label>
          <input
            id="full_name"
            type="text"
            autoComplete="name"
            className={`form-input ${errors.full_name ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
            placeholder="Nhập họ và tên của bạn"
            {...register('full_name', {
              required: 'Họ và tên là bắt buộc',
              minLength: {
                value: 2,
                message: 'Họ và tên phải có ít nhất 2 ký tự',
              },
              maxLength: {
                value: 100,
                message: 'Họ và tên không được vượt quá 100 ký tự',
              },
            })}
          />
          {errors.full_name && (
            <p className="form-error">{errors.full_name.message}</p>
          )}
        </div>

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

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="form-label">
            Số điện thoại
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            className={`form-input ${errors.phone ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
            placeholder="Nhập số điện thoại của bạn"
            {...register('phone', {
              required: 'Số điện thoại là bắt buộc',
              pattern: {
                value: /^(\+84|84|0)[1-9][0-9]{8,9}$/,
                message: 'Vui lòng nhập số điện thoại Việt Nam hợp lệ',
              },
            })}
          />
          {errors.phone && (
            <p className="form-error">{errors.phone.message}</p>
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
              autoComplete="new-password"
              className={`form-input pr-10 ${errors.password ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
              placeholder="Tạo mật khẩu"
              {...register('password', {
                required: 'Mật khẩu là bắt buộc',
                minLength: {
                  value: 8,
                  message: 'Mật khẩu phải có ít nhất 8 ký tự',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                  message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
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

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="form-label">
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`form-input pr-10 ${errors.confirmPassword ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
              placeholder="Nhập lại mật khẩu"
              {...register('confirmPassword', {
                required: 'Vui lòng xác nhận mật khẩu',
                validate: (value) =>
                  value === watchPassword || 'Mật khẩu không khớp',
              })}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="form-error">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              type="checkbox"
              className="form-checkbox"
              {...register('terms', {
                required: 'Bạn phải chấp nhận điều khoản và điều kiện',
              })}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="text-gray-600">
              Tôi đồng ý với{' '}
              <a href="/terms" className="text-primary-600 hover:text-primary-500">
                Điều khoản và Điều kiện
              </a>{' '}
              và{' '}
              <a href="/privacy" className="text-primary-600 hover:text-primary-500">
                Chính sách Bảo mật
              </a>
            </label>
          </div>
        </div>
        {errors.terms && (
          <p className="form-error">{errors.terms.message}</p>
        )}

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
                Đang tạo tài khoản...
              </div>
            ) : (
              'Tạo tài khoản'
            )}
          </button>
        </div>
      </form>

      {/* Password requirements */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Yêu cầu mật khẩu:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Ít nhất 8 ký tự</li>
          <li>• Chứa ít nhất 1 chữ hoa</li>
          <li>• Chứa ít nhất 1 chữ thường</li>
          <li>• Chứa ít nhất 1 số</li>
          <li>• Chứa ít nhất 1 ký tự đặc biệt (@$!%*?&)</li>
        </ul>
      </div>
    </div>
  );
};

export default RegisterPage;