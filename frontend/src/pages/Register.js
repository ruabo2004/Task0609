import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const { register: registerUser, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm();

  const watchPassword = watch('password');

  useEffect(() => {
    if (isAuthenticated() && !loading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const { confirmPassword, ...userData } = data;
      const result = await registerUser(userData);
      
      if (result.success) {
        navigate('/', { replace: true });
      } else {
        setError('root', {
          type: 'manual',
          message: result.message || 'Đăng ký thất bại'
        });
      }
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: 'Có lỗi xảy ra, vui lòng thử lại'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Tạo tài khoản mới
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Hoặc{' '}
            
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="form-group">
                <label htmlFor="full_name" className="form-label">
                  Họ và tên *
                </label>
                <input
                  {...register('full_name', {
                    required: 'Họ và tên là bắt buộc',
                    minLength: {
                      value: 2,
                      message: 'Họ và tên phải có ít nhất 2 ký tự'
                    },
                    maxLength: {
                      value: 100,
                      message: 'Họ và tên không được quá 100 ký tự'
                    }
                  })}
                  type="text"
                  id="full_name"
                  className={`form-input ${errors.full_name ? 'error' : ''}`}
                  placeholder="Nhập họ và tên của bạn"
                  autoComplete="name"
                />
                {errors.full_name && (
                  <p className="form-error">{errors.full_name.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email *
                </label>
                <input
                  {...register('email', {
                    required: 'Email là bắt buộc',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Email không hợp lệ'
                    }
                  })}
                  type="email"
                  id="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Nhập email của bạn"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Số điện thoại
                </label>
                <input
                  {...register('phone', {
                    pattern: {
                      value: /^[0-9]{10,11}$/,
                      message: 'Số điện thoại không hợp lệ (10-11 số)'
                    }
                  })}
                  type="tel"
                  id="phone"
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="Nhập số điện thoại"
                  autoComplete="tel"
                />
                {errors.phone && (
                  <p className="form-error">{errors.phone.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Mật khẩu *
                </label>
                <div className="relative">
                  <input
                    {...register('password', {
                      required: 'Mật khẩu là bắt buộc',
                      minLength: {
                        value: 6,
                        message: 'Mật khẩu phải có ít nhất 6 ký tự'
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className={`form-input pr-10 ${errors.password ? 'error' : ''}`}
                    placeholder="Nhập mật khẩu"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && (
                  <p className="form-error">{errors.password.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Xác nhận mật khẩu *
                </label>
                <div className="relative">
                  <input
                    {...register('confirmPassword', {
                      required: 'Xác nhận mật khẩu là bắt buộc',
                      validate: (value) =>
                        value === watchPassword || 'Mật khẩu xác nhận không khớp'
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className={`form-input pr-10 ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Nhập lại mật khẩu"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="form-error">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="address" className="form-label">
                  Địa chỉ
                </label>
                <textarea
                  {...register('address', {
                    maxLength: {
                      value: 500,
                      message: 'Địa chỉ không được quá 500 ký tự'
                    }
                  })}
                  id="address"
                  rows={3}
                  className={`form-input form-textarea ${errors.address ? 'error' : ''}`}
                  placeholder="Nhập địa chỉ của bạn"
                />
                {errors.address && (
                  <p className="form-error">{errors.address.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="date_of_birth" className="form-label">
                  Ngày sinh
                </label>
                <input
                  {...register('date_of_birth', {
                    validate: (value) => {
                      if (value) {
                        const today = new Date();
                        const birthDate = new Date(value);
                        const age = today.getFullYear() - birthDate.getFullYear();
                        if (age < 16 || age > 120) {
                          return 'Tuổi phải từ 16 đến 120';
                        }
                      }
                      return true;
                    }
                  })}
                  type="date"
                  id="date_of_birth"
                  className={`form-input ${errors.date_of_birth ? 'error' : ''}`}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
                />
                {errors.date_of_birth && (
                  <p className="form-error">{errors.date_of_birth.message}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  {...register('agreeToTerms', {
                    required: 'Bạn phải đồng ý với điều khoản sử dụng'
                  })}
                  id="agreeToTerms"
                  type="checkbox"
                  className="h-4 w-4 text-primary-color focus:ring-primary-color border-gray-300 rounded"
                />
                <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
                  Tôi đồng ý với{' '}
                  <a href="#" className="text-primary-color hover:text-primary-dark">
                    điều khoản sử dụng
                  </a>{' '}
                  và{' '}
                  <a href="#" className="text-primary-color hover:text-primary-dark">
                    chính sách bảo mật
                  </a>
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="form-error">{errors.agreeToTerms.message}</p>
              )}

              {errors.root && (
                <div className="alert alert-error">
                  {errors.root.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner w-5 h-5 mr-2"></div>
                    Đang tạo tài khoản...
                  </div>
                ) : (
                  'Tạo tài khoản'
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{' '}
            
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
