import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ArrowRight,
  Lock,
} from "lucide-react";
import Input from "@components/Form/Input";
import PasswordInput from "@components/Form/PasswordInput";
import Button from "@components/Form/Button";
import Select from "@components/Form/Select";
import Checkbox from "@components/Form/Checkbox";
import FormError from "@components/Form/FormError";
import { validationRules } from "@utils/validation";
import { ROUTES, GENDER_OPTIONS } from "@utils/constants";

/**
 * Register Form Component
 * Comprehensive registration form with validation
 */
const RegisterForm = ({ onSubmit, loading = false, error = null }) => {
  const [termsAccepted, setTermsAccepted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
      date_of_birth: "",
      gender: "",
      address: "",
    },
  });

  const watchPassword = watch("password");

  const handleFormSubmit = (data) => {
    if (!termsAccepted) {
      return;
    }

    // Remove confirm_password from submission data
    const { confirm_password, ...submitData } = data;
    onSubmit(submitData);
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tạo tài khoản mới
        </h1>
        <p className="text-gray-600">
          Điền thông tin bên dưới để tạo tài khoản của bạn
        </p>
      </div>

      {/* Error Message */}
      {error && <FormError error={error} className="mb-6" />}

      {/* Registration Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Name and Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            type="text"
            name="full_name"
            label="Họ và tên"
            placeholder="Nhập họ và tên đầy đủ"
            icon={User}
            autoComplete="name"
            required
            error={errors.full_name?.message}
            {...register("full_name", validationRules.fullName)}
          />

          <Input
            type="email"
            name="email"
            label="Email"
            placeholder="Nhập địa chỉ email"
            icon={Mail}
            autoComplete="email"
            required
            error={errors.email?.message}
            {...register("email", validationRules.email)}
          />
        </div>

        {/* Phone Field */}
        <Input
          type="tel"
          name="phone"
          label="Số điện thoại"
          placeholder="Nhập số điện thoại (10-11 chữ số)"
          icon={Phone}
          autoComplete="tel"
          required
          error={errors.phone?.message}
          {...register("phone", validationRules.phone)}
        />

        {/* Password Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PasswordInput
            name="password"
            label="Mật khẩu"
            placeholder="Tạo mật khẩu mạnh"
            autoComplete="new-password"
            showStrength
            required
            error={errors.password?.message}
            value={watchPassword || ""}
            {...register("password", validationRules.password)}
          />

          <Input
            type="password"
            name="confirm_password"
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            autoComplete="new-password"
            icon={Lock}
            required
            error={errors.confirm_password?.message}
            {...register(
              "confirm_password",
              validationRules.confirmPassword(watchPassword)
            )}
          />
        </div>

        {/* Optional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            Thông tin bổ sung (không bắt buộc)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="date"
              name="date_of_birth"
              label="Ngày sinh"
              icon={Calendar}
              error={errors.date_of_birth?.message}
              {...register("date_of_birth", validationRules.dateOfBirth)}
            />

            <Select
              name="gender"
              label="Giới tính"
              placeholder="Chọn giới tính"
              options={GENDER_OPTIONS}
              error={errors.gender?.message}
              {...register("gender")}
            />
          </div>

          <Input
            type="text"
            name="address"
            label="Địa chỉ"
            placeholder="Nhập địa chỉ của bạn"
            icon={MapPin}
            error={errors.address?.message}
            {...register("address")}
          />
        </div>

        {/* Terms and Conditions */}
        <div className="space-y-4">
          <Checkbox
            name="terms_accepted"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            required
            error={
              !termsAccepted && isValid
                ? "Bạn phải đồng ý với điều khoản sử dụng"
                : ""
            }
            label={
              <span className="text-sm">
                Tôi đồng ý với{" "}
                <Link
                  to="/terms"
                  className="text-primary-600 hover:text-primary-800 underline"
                >
                  Điều khoản sử dụng
                </Link>{" "}
                và{" "}
                <Link
                  to="/privacy"
                  className="text-primary-600 hover:text-primary-800 underline"
                >
                  Chính sách bảo mật
                </Link>
              </span>
            }
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          disabled={!isValid || !termsAccepted}
          rightIcon={ArrowRight}
        >
          Tạo tài khoản
        </Button>
      </form>

      {/* Divider */}
      <div className="mt-8 mb-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Hoặc</span>
          </div>
        </div>
      </div>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-gray-600">
          Đã có tài khoản?{" "}
          <Link
            to={ROUTES.LOGIN}
            className="font-medium text-primary-600 hover:text-primary-800 transition-colors duration-200"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
