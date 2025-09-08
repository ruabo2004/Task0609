import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { currentUser, updateProfile, changePassword } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
    setError: setProfileError
  } = useForm({
    defaultValues: {
      full_name: currentUser?.full_name || '',
      phone: currentUser?.phone || '',
      address: currentUser?.address || '',
      date_of_birth: currentUser?.date_of_birth?.split('T')[0] || ''
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    setError: setPasswordError,
    watch: watchPassword
  } = useForm();

  const watchNewPassword = watchPassword('newPassword');

  const onSubmitProfile = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await updateProfile(data);
      if (result.success) {
        setIsEditingProfile(false);
        resetProfile(data);
      } else {
        setProfileError('root', {
          type: 'manual',
          message: result.message || 'Cập nhật thông tin thất bại'
        });
      }
    } catch (error) {
      setProfileError('root', {
        type: 'manual',
        message: 'Có lỗi xảy ra, vui lòng thử lại'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitPassword = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      
      if (result.success) {
        setIsChangingPassword(false);
        resetPassword();
      } else {
        setPasswordError('root', {
          type: 'manual',
          message: result.message || 'Đổi mật khẩu thất bại'
        });
      }
    } catch (error) {
      setPasswordError('root', {
        type: 'manual',
        message: 'Có lỗi xảy ra, vui lòng thử lại'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    resetProfile({
      full_name: currentUser?.full_name || '',
      phone: currentUser?.phone || '',
      address: currentUser?.address || '',
      date_of_birth: currentUser?.date_of_birth?.split('T')[0] || ''
    });
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    resetPassword();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary-color rounded-full flex items-center justify-center mx-auto mb-4">
              
            </div>
            <h1 className="text-3xl font-bold mb-2">Thông tin cá nhân</h1>
            <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <div className="card">
              <div className="card-header flex justify-between items-center">
                <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="btn btn-outline btn-sm flex items-center gap-2"
                  >
                    
                    Chỉnh sửa
                  </button>
                )}
              </div>
              <div className="card-body">
                {!isEditingProfile ? (
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Họ và tên</label>
                      <p className="text-gray-800">{currentUser?.full_name || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <label className="form-label">Email</label>
                      <p className="text-gray-800">{currentUser?.email}</p>
                    </div>
                    <div>
                      <label className="form-label">Số điện thoại</label>
                      <p className="text-gray-800">{currentUser?.phone || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <label className="form-label">Địa chỉ</label>
                      <p className="text-gray-800">{currentUser?.address || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <label className="form-label">Ngày sinh</label>
                      <p className="text-gray-800">{formatDate(currentUser?.date_of_birth)}</p>
                    </div>
                    <div>
                      <label className="form-label">Ngày tạo tài khoản</label>
                      <p className="text-gray-800">{formatDate(currentUser?.created_at)}</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
                    <div className="form-group">
                      <label htmlFor="full_name" className="form-label">
                        Họ và tên *
                      </label>
                      <input
                        {...registerProfile('full_name', {
                          required: 'Họ và tên là bắt buộc',
                          minLength: {
                            value: 2,
                            message: 'Họ và tên phải có ít nhất 2 ký tự'
                          }
                        })}
                        type="text"
                        id="full_name"
                        className={`form-input ${profileErrors.full_name ? 'error' : ''}`}
                        placeholder="Nhập họ và tên"
                      />
                      {profileErrors.full_name && (
                        <p className="form-error">{profileErrors.full_name.message}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone" className="form-label">
                        Số điện thoại
                      </label>
                      <input
                        {...registerProfile('phone', {
                          pattern: {
                            value: /^[0-9]{10,11}$/,
                            message: 'Số điện thoại không hợp lệ (10-11 số)'
                          }
                        })}
                        type="tel"
                        id="phone"
                        className={`form-input ${profileErrors.phone ? 'error' : ''}`}
                        placeholder="Nhập số điện thoại"
                      />
                      {profileErrors.phone && (
                        <p className="form-error">{profileErrors.phone.message}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="address" className="form-label">
                        Địa chỉ
                      </label>
                      <textarea
                        {...registerProfile('address')}
                        id="address"
                        rows={3}
                        className="form-input form-textarea"
                        placeholder="Nhập địa chỉ"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="date_of_birth" className="form-label">
                        Ngày sinh
                      </label>
                      <input
                        {...registerProfile('date_of_birth')}
                        type="date"
                        id="date_of_birth"
                        className="form-input"
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
                      />
                    </div>

                    {profileErrors.root && (
                      <div className="alert alert-error">
                        {profileErrors.root.message}
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary flex items-center gap-2"
                      >
                        
                        {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="btn btn-outline flex items-center gap-2"
                      >
                        
                        Hủy
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header flex justify-between items-center">
                <h2 className="text-xl font-semibold">Đổi mật khẩu</h2>
                {!isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="btn btn-outline btn-sm flex items-center gap-2"
                  >
                    
                    Đổi mật khẩu
                  </button>
                )}
              </div>
              <div className="card-body">
                {!isChangingPassword ? (
                  <div className="text-center py-8">
                    
                    <p className="text-gray-600">
                      Bảo mật tài khoản của bạn bằng cách thay đổi mật khẩu định kỳ
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                    <div className="form-group">
                      <label htmlFor="currentPassword" className="form-label">
                        Mật khẩu hiện tại *
                      </label>
                      <input
                        {...registerPassword('currentPassword', {
                          required: 'Mật khẩu hiện tại là bắt buộc'
                        })}
                        type="password"
                        id="currentPassword"
                        className={`form-input ${passwordErrors.currentPassword ? 'error' : ''}`}
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      {passwordErrors.currentPassword && (
                        <p className="form-error">{passwordErrors.currentPassword.message}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="newPassword" className="form-label">
                        Mật khẩu mới *
                      </label>
                      <input
                        {...registerPassword('newPassword', {
                          required: 'Mật khẩu mới là bắt buộc',
                          minLength: {
                            value: 6,
                            message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
                          },
                          pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                            message: 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số'
                          }
                        })}
                        type="password"
                        id="newPassword"
                        className={`form-input ${passwordErrors.newPassword ? 'error' : ''}`}
                        placeholder="Nhập mật khẩu mới"
                      />
                      {passwordErrors.newPassword && (
                        <p className="form-error">{passwordErrors.newPassword.message}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirmPassword" className="form-label">
                        Xác nhận mật khẩu mới *
                      </label>
                      <input
                        {...registerPassword('confirmPassword', {
                          required: 'Xác nhận mật khẩu là bắt buộc',
                          validate: (value) =>
                            value === watchNewPassword || 'Mật khẩu xác nhận không khớp'
                        })}
                        type="password"
                        id="confirmPassword"
                        className={`form-input ${passwordErrors.confirmPassword ? 'error' : ''}`}
                        placeholder="Nhập lại mật khẩu mới"
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="form-error">{passwordErrors.confirmPassword.message}</p>
                      )}
                    </div>

                    {passwordErrors.root && (
                      <div className="alert alert-error">
                        {passwordErrors.root.message}
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary flex items-center gap-2"
                      >
                        
                        {isSubmitting ? 'Đang đổi...' : 'Đổi mật khẩu'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelPasswordChange}
                        className="btn btn-outline flex items-center gap-2"
                      >
                        
                        Hủy
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
