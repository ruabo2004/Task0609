import React, { useState } from "react";
import { useAuth } from "@contexts/AuthContext";
import { useForm } from "react-hook-form";
import { User, Mail, Phone, Calendar, MapPin, Camera, Key } from "lucide-react";
import Input from "@components/Form/Input";
import PasswordInput from "@components/Form/PasswordInput";
import Button from "@components/Form/Button";
import Select from "@components/Form/Select";
import FormError from "@components/Form/FormError";
import { validationRules } from "@utils/validation";
import { GENDER_OPTIONS } from "@utils/constants";
import { formatDate } from "@utils/helpers";

/**
 * Profile Page
 * User profile management with tabs
 */
const Profile = () => {
  const { user, updateProfile, changePassword, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [profileError, setProfileError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  // Profile form
  const profileForm = useForm({
    mode: "onChange",
    defaultValues: {
      full_name: user?.full_name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      date_of_birth: user?.date_of_birth || "",
      gender: user?.gender || "",
      address: user?.address || "",
    },
  });

  // Password form
  const passwordForm = useForm({
    mode: "onChange",
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const handleProfileUpdate = async (data) => {
    setProfileError(null);
    const result = await updateProfile(data);
    if (!result.success) {
      setProfileError(result.error);
    }
  };

  const handlePasswordChange = async (data) => {
    setPasswordError(null);
    const { confirm_password, ...passwordData } = data;
    const result = await changePassword(passwordData);
    if (result.success) {
      passwordForm.reset();
    } else {
      setPasswordError(result.error);
    }
  };

  const tabs = [
    { id: "profile", name: "Thông tin cá nhân", icon: User },
    { id: "password", name: "Đổi mật khẩu", icon: Key },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <User className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.full_name}
                </h1>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-sm text-gray-500">
                  Thành viên từ {formatDate(user?.created_at, "long")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "border-b-2 border-primary-600 text-primary-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Cập nhật thông tin cá nhân
                </h2>

                {profileError && (
                  <FormError error={profileError} className="mb-6" />
                )}

                <form
                  onSubmit={profileForm.handleSubmit(handleProfileUpdate)}
                  className="space-y-6"
                >
                  {/* Name and Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      type="text"
                      name="full_name"
                      label="Họ và tên"
                      icon={User}
                      error={profileForm.formState.errors.full_name?.message}
                      {...profileForm.register(
                        "full_name",
                        validationRules.fullName
                      )}
                    />

                    <Input
                      type="email"
                      name="email"
                      label="Email"
                      icon={Mail}
                      disabled
                      helperText="Email không thể thay đổi"
                      {...profileForm.register("email")}
                    />
                  </div>

                  {/* Phone */}
                  <Input
                    type="tel"
                    name="phone"
                    label="Số điện thoại"
                    icon={Phone}
                    error={profileForm.formState.errors.phone?.message}
                    {...profileForm.register("phone", validationRules.phone)}
                  />

                  {/* Date of Birth and Gender */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      type="date"
                      name="date_of_birth"
                      label="Ngày sinh"
                      icon={Calendar}
                      error={
                        profileForm.formState.errors.date_of_birth?.message
                      }
                      {...profileForm.register(
                        "date_of_birth",
                        validationRules.dateOfBirth
                      )}
                    />

                    <Select
                      name="gender"
                      label="Giới tính"
                      options={GENDER_OPTIONS}
                      error={profileForm.formState.errors.gender?.message}
                      {...profileForm.register("gender")}
                    />
                  </div>

                  {/* Address */}
                  <Input
                    type="text"
                    name="address"
                    label="Địa chỉ"
                    icon={MapPin}
                    error={profileForm.formState.errors.address?.message}
                    {...profileForm.register("address")}
                  />

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      loading={isLoading}
                      disabled={!profileForm.formState.isValid}
                    >
                      Cập nhật thông tin
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Đổi mật khẩu
                </h2>

                {passwordError && (
                  <FormError error={passwordError} className="mb-6" />
                )}

                <form
                  onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
                  className="space-y-6 max-w-md"
                >
                  <PasswordInput
                    name="current_password"
                    label="Mật khẩu hiện tại"
                    placeholder="Nhập mật khẩu hiện tại"
                    autoComplete="current-password"
                    required
                    error={
                      passwordForm.formState.errors.current_password?.message
                    }
                    {...passwordForm.register(
                      "current_password",
                      validationRules.password
                    )}
                  />

                  <PasswordInput
                    name="new_password"
                    label="Mật khẩu mới"
                    placeholder="Nhập mật khẩu mới"
                    autoComplete="new-password"
                    showStrength
                    required
                    error={passwordForm.formState.errors.new_password?.message}
                    {...passwordForm.register(
                      "new_password",
                      validationRules.password
                    )}
                  />

                  <PasswordInput
                    name="confirm_password"
                    label="Xác nhận mật khẩu mới"
                    placeholder="Nhập lại mật khẩu mới"
                    autoComplete="new-password"
                    showToggle={false}
                    required
                    error={
                      passwordForm.formState.errors.confirm_password?.message
                    }
                    {...passwordForm.register(
                      "confirm_password",
                      validationRules.confirmPassword(
                        passwordForm.watch("new_password")
                      )
                    )}
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      loading={isLoading}
                      disabled={!passwordForm.formState.isValid}
                    >
                      Đổi mật khẩu
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
