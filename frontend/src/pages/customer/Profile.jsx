import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateProfile, useChangePassword } from '@/hooks/useAuth';
import { useBookings } from '@/hooks/useBookings';
import { apiService } from '@/services/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Modal,
} from '@/components';
import {
  UserIcon,
  CameraIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

/**
 * Helper function to convert database date to form date format
 * Backend now returns dates as strings, so this is much simpler
 */
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  // Backend now returns dates as YYYY-MM-DD strings, so just return as is
  if (typeof dateString === 'string') {
    return dateString;
  }
  
  // Fallback for any remaining Date objects (shouldn't happen now)
  if (dateString instanceof Date) {
    return dateString.toISOString().split('T')[0];
  }
  
  return '';
};

/**
 * Input component with password toggle
 */
const PasswordInput = ({ 
  label, 
  showPassword, 
  togglePassword, 
  error, 
  autoComplete,
  ...props 
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          type={showPassword ? 'text' : 'password'}
          autoComplete={autoComplete}
          className={`
            block w-full px-3 py-2 pr-10 border rounded-md shadow-sm
            focus:ring-primary-500 focus:border-primary-500
            ${error 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300'
            }
          `}
        />
        <button
          type="button"
          onClick={togglePassword}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

/**
 * Profile page - Customer profile management
 */
const Profile = () => {
  const { user, updateUser } = useAuth();
  
  // Fetch booking stats
  const { bookings, loading: bookingsLoading } = useBookings({}, { immediate: true });
  
  // Calculate stats from bookings
  const stats = React.useMemo(() => {

    if (!bookings || bookings.length === 0) {

      return {
        totalBookings: 0,
        completedBookings: 0,
        totalSpent: 0,
      };
    }
    
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'checked_out').length;
    const totalSpent = bookings
      .filter(b => b.status === 'checked_out')
      .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);

    return {
      totalBookings,
      completedBookings,
      totalSpent,
    };
  }, [bookings]);
  
  // Use hooks for API calls
  const { mutate: updateProfile, loading } = useUpdateProfile({
    onSuccess: (updatedUser) => {

      toast.success('Cập nhật thông tin thành công!');
    },
    onError: (error) => {
      console.error('❌ Profile update failed:', error);
      toast.error(error.message || 'Cập nhật thông tin thất bại. Vui lòng thử lại.');
    },
  });
  
  const { mutate: changePassword, loading: passwordLoading } = useChangePassword({
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công!');
      setShowPasswordModal(false);
      resetPasswordForm();
      // Reset password visibility
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Đổi mật khẩu thất bại.');
    },
  });  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    setValue,
  } = useForm({
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      date_of_birth: formatDateForInput(user?.date_of_birth),
      nationality: user?.nationality || 'Vietnamese',
      id_number: user?.id_number || '',
    },
  });
  
  // Debug user data and update form values
  useEffect(() => {

    // Update form values when user data changes
    if (user) {
      setValue('full_name', user.full_name || '');
      setValue('email', user.email || '');
      setValue('phone', user.phone || '');
      setValue('address', user.address || '');
      
      // Handle date properly to avoid timezone issues
      setValue('date_of_birth', formatDateForInput(user.date_of_birth));
      
      setValue('nationality', user.nationality || 'Vietnamese');
      setValue('id_number', user.id_number || '');
    }
  }, [user, setValue]);

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
    watch,
  } = useForm();

  const watchNewPassword = watch('newPassword');

  // Handle profile update
  const onProfileSubmit = async (data) => {
    // Remove email from data as it shouldn't be updated
    const { email, ...updateData } = data;
    
    // Fix date format to avoid timezone issues
    if (updateData.date_of_birth) {
      // Ensure the date is sent in YYYY-MM-DD format without timezone conversion
      const dateValue = updateData.date_of_birth;
      if (typeof dateValue === 'string' && dateValue.includes('-')) {
        updateData.date_of_birth = dateValue; // Keep as is if already in correct format
      }
    }
    
    // Log data being sent for debugging

    updateProfile(updateData);
  };

  // Handle password change
  const onPasswordSubmit = async (data) => {
    changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  // Handle avatar upload
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.');
      return;
    }

    try {
      // API call to upload avatar

      // Simulate upload
      const avatarUrl = URL.createObjectURL(file);
      updateUser({ ...user, avatar: avatarUrl });
      
      toast.success('Avatar updated successfully!');
    } catch (error) {
      toast.error('Failed to upload avatar.');
      console.error('Avatar upload error:', error);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    try {

      // Call API to delete account
      const response = await apiService.delete('/users/me');
      
      if (response.data && response.data.success) {
        toast.success('Tài khoản đã được xóa thành công');
        setShowDeleteAccountModal(false);
        
        // Logout and redirect to home
        setTimeout(() => {
          // Clear auth data
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/';
        }, 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa tài khoản. Vui lòng thử lại.');
      console.error('Delete account error:', error);
    }
  };

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent>
              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt="Avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 h-6 w-6 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors"
                    >
                      <CameraIcon className="h-3 w-3 text-white" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{user?.full_name}</h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Thành viên từ {new Date(user?.created_at || Date.now()).getFullYear()}
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Họ và tên"
                    {...registerProfile('full_name', {
                      required: 'Họ và tên là bắt buộc',
                      minLength: {
                        value: 2,
                        message: 'Tên phải có ít nhất 2 ký tự',
                      },
                    })}
                    error={profileErrors.full_name?.message}
                    required
                  />
                  
                  <Input
                    label="Email"
                    type="email"
                    {...registerProfile('email', {
                      required: 'Email là bắt buộc',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Địa chỉ email không hợp lệ',
                      },
                    })}
                    error={profileErrors.email?.message}
                    required
                    disabled // Usually email can't be changed
                  />
                  
                  <Input
                    label="Số điện thoại"
                    type="tel"
                    {...registerProfile('phone', {
                      pattern: {
                        value: /^(\+84|84|0)[1-9][0-9]{8,9}$/,
                        message: 'Số điện thoại Việt Nam không hợp lệ',
                      },
                    })}
                    error={profileErrors.phone?.message}
                  />
                  
                  <Input
                    label="Ngày sinh"
                    type="date"
                    {...registerProfile('date_of_birth')}
                    error={profileErrors.date_of_birth?.message}
                  />
                  
                  <Input
                    label="Quốc tịch"
                    {...registerProfile('nationality')}
                    error={profileErrors.nationality?.message}
                  />
                  
                  <Input
                    label="Số CMND/CCCD"
                    {...registerProfile('id_number', {
                      pattern: {
                        value: /^[0-9]{9}$|^[0-9]{12}$/,
                        message: 'Số CMND/CCCD phải có 9 hoặc 12 chữ số',
                      },
                    })}
                    error={profileErrors.id_number?.message}
                    helperText="CMND: 9 số, CCCD: 12 số"
                  />
                </div>
                
                <Input
                  label="Địa chỉ"
                  {...registerProfile('address')}
                  error={profileErrors.address?.message}
                  fullWidth
                />

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    disabled={loading}
                  >
                    Lưu thay đổi
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt tài khoản</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  leftIcon={<KeyIcon className="h-4 w-4" />}
                  onClick={() => setShowPasswordModal(true)}
                  fullWidth
                >
                  Đổi mật khẩu
                </Button>
                
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteAccountModal(true)}
                  fullWidth
                  className="!bg-red-600 hover:!bg-red-700 !text-white"
                >
                  Xóa tài khoản
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Thống kê tài khoản</CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tổng số đặt phòng:</span>
                    <span className="font-medium">{stats.totalBookings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lượt lưu trú hoàn thành:</span>
                    <span className="font-medium">{stats.completedBookings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tổng chi tiêu:</span>
                    <span className="font-medium text-primary-600">
                      {new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND' 
                      }).format(stats.totalSpent)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Đổi mật khẩu"
        footer={
          <>
            <Button
              variant="primary"
              onClick={handlePasswordSubmit(onPasswordSubmit)}
              loading={passwordLoading}
              disabled={passwordLoading}
            >
              Đổi mật khẩu
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowPasswordModal(false);
                // Reset password visibility
                setShowCurrentPassword(false);
                setShowNewPassword(false);
                setShowConfirmPassword(false);
              }}
              disabled={passwordLoading}
            >
              Hủy
            </Button>
          </>
        }
      >
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
          <PasswordInput
            label="Mật khẩu hiện tại"
            showPassword={showCurrentPassword}
            togglePassword={() => setShowCurrentPassword(!showCurrentPassword)}
            {...registerPassword('currentPassword', {
              required: 'Mật khẩu hiện tại là bắt buộc',
            })}
            error={passwordErrors.currentPassword?.message}
            autoComplete="current-password"
          />
          
          <PasswordInput
            label="Mật khẩu mới"
            showPassword={showNewPassword}
            togglePassword={() => setShowNewPassword(!showNewPassword)}
            {...registerPassword('newPassword', {
              required: 'Mật khẩu mới là bắt buộc',
              minLength: {
                value: 8,
                message: 'Mật khẩu phải có ít nhất 8 ký tự',
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                message: 'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt',
              },
            })}
            error={passwordErrors.newPassword?.message}
            autoComplete="new-password"
          />
          
          <PasswordInput
            label="Xác nhận mật khẩu mới"
            showPassword={showConfirmPassword}
            togglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            {...registerPassword('confirmPassword', {
              required: 'Vui lòng xác nhận mật khẩu mới',
              validate: (value) =>
                value === watchNewPassword || 'Mật khẩu không khớp',
            })}
            error={passwordErrors.confirmPassword?.message}
            autoComplete="new-password"
          />
        </form>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        title="Xác nhận xóa tài khoản"
        footer={
          <>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              className="!bg-red-600 hover:!bg-red-700 !text-white"
            >
              Xác nhận xóa
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteAccountModal(false)}
            >
              Hủy
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium mb-2">⚠️ Cảnh báo quan trọng!</p>
            <p className="text-red-700 text-sm">
              Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn, bao gồm:
            </p>
          </div>
          
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-2">
            <li>Thông tin cá nhân</li>
            <li>Lịch sử đặt phòng</li>
            <li>Đánh giá và nhận xét</li>
            <li>Dữ liệu thanh toán</li>
          </ul>
          
          <p className="text-sm text-gray-600 mt-4">
            Bạn có chắc chắn muốn xóa tài khoản của mình không?
          </p>
        </div>
      </Modal>

    </div>
  );
};

export default Profile;
