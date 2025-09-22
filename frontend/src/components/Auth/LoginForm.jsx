import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import Input from "@components/Form/Input";
import PasswordInput from "@components/Form/PasswordInput";
import Button from "@components/Form/Button";
import Checkbox from "@components/Form/Checkbox";
import FormError from "@components/Form/FormError";
import { validationRules } from "@utils/validation";
import { ROUTES } from "@utils/constants";

/**
 * Login Form Component
 * Beautiful and modern login form with validation
 */
const LoginForm = ({ onSubmit, loading = false, error = null }) => {
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      remember_me: rememberMe,
    });
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập</h1>
        <p className="text-gray-600">
          Chào mừng bạn quay trở lại! Vui lòng đăng nhập vào tài khoản của bạn.
        </p>
      </div>

      {/* Error Message */}
      {error && <FormError error={error} className="mb-6" />}

      {/* Login Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Email Field */}
        <Input
          type="email"
          name="email"
          label="Email"
          placeholder="Nhập địa chỉ email của bạn"
          icon={Mail}
          autoComplete="email"
          error={errors.email?.message}
          {...register("email", validationRules.email)}
        />

        {/* Password Field */}
        <PasswordInput
          name="password"
          label="Mật khẩu"
          placeholder="Nhập mật khẩu của bạn"
          autoComplete="current-password"
          error={errors.password?.message}
          value={watch("password") || ""}
          {...register("password", validationRules.loginPassword)}
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <Checkbox
            name="remember_me"
            label="Ghi nhớ đăng nhập"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />

          <Link
            to="/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors duration-200"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          disabled={!isValid}
          rightIcon={ArrowRight}
        >
          Đăng nhập
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

      {/* Register Link */}
      <div className="text-center">
        <p className="text-gray-600">
          Chưa có tài khoản?{" "}
          <Link
            to={ROUTES.REGISTER}
            className="font-medium text-primary-600 hover:text-primary-800 transition-colors duration-200"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
