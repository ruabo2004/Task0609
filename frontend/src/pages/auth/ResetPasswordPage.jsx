import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

/**
 * ResetPasswordPage component for password reset
 */
const ResetPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  
  const resetToken = searchParams.get('token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const watchPassword = watch('password');

  // Check if reset token exists
  useEffect(() => {
    if (!resetToken) {
      toast.error('Invalid or missing reset token.');
      navigate('/auth/forgot-password');
    }
  }, [resetToken, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await resetPassword(resetToken, data.password);
      setResetSuccess(true);
      toast.success('Password reset successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueToLogin = () => {
    navigate('/auth/login');
  };

  if (resetSuccess) {
    return (
      <div className="text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success-100">
          <CheckCircleIcon className="h-6 w-6 text-success-600" />
        </div>
        
        <h2 className="mt-6 text-2xl font-bold text-gray-900">
          Password reset successful!
        </h2>
        
        <p className="mt-2 text-sm text-gray-600">
          Your password has been successfully reset. You can now sign in with your new password.
        </p>

        <div className="mt-6">
          <button
            onClick={handleContinueToLogin}
            className="w-full btn-primary"
          >
            Continue to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Please enter your new password below.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* New Password */}
        <div>
          <label htmlFor="password" className="form-label">
            New Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`form-input pr-10 ${errors.password ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
              placeholder="Enter your new password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                  message: 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
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

        {/* Confirm New Password */}
        <div>
          <label htmlFor="confirmPassword" className="form-label">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`form-input pr-10 ${errors.confirmPassword ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
              placeholder="Confirm your new password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === watchPassword || 'Passwords do not match',
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
                Resetting password...
              </div>
            ) : (
              'Reset password'
            )}
          </button>
        </div>
      </form>

      {/* Back to login */}
      <div className="mt-6 text-center">
        <Link
          to="/auth/login"
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          Back to login
        </Link>
      </div>

      {/* Password requirements */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Password Requirements:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• At least 8 characters long</li>
          <li>• Contains at least 1 uppercase letter</li>
          <li>• Contains at least 1 lowercase letter</li>
          <li>• Contains at least 1 number</li>
          <li>• Contains at least 1 special character (@$!%*?&)</li>
        </ul>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
