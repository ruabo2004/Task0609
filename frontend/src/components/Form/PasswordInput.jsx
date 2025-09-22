import React, { useState, forwardRef } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { clsx } from "clsx";
import Input from "./Input";
import { checkPasswordStrength } from "@utils/validation";

/**
 * Password Input Component with show/hide toggle and strength indicator
 */
const PasswordInput = forwardRef(
  (
    {
      name,
      label = "Mật khẩu",
      placeholder = "Nhập mật khẩu",
      value,
      onChange,
      onBlur,
      error,
      required = false,
      disabled = false,
      showStrength = false,
      showToggle = true,
      autoComplete = "current-password",
      className = "",
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    // Calculate password strength
    const passwordStrength =
      showStrength && value ? checkPasswordStrength(value) : null;

    const getStrengthColor = (level) => {
      switch (level) {
        case "weak":
          return "bg-danger-500";
        case "medium":
          return "bg-warning-500";
        case "strong":
          return "bg-success-500";
        default:
          return "bg-gray-300";
      }
    };

    const getStrengthText = (level) => {
      switch (level) {
        case "weak":
          return "Yếu";
        case "medium":
          return "Trung bình";
        case "strong":
          return "Mạnh";
        default:
          return "";
      }
    };

    return (
      <div className={className}>
        <Input
          ref={ref}
          type={showPassword ? "text" : "password"}
          name={name}
          label={label}
          placeholder={placeholder}
          value={value || ""}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          icon={Lock}
          rightIcon={showToggle ? (showPassword ? EyeOff : Eye) : undefined}
          onRightIconClick={showToggle ? togglePasswordVisibility : undefined}
          {...props}
        />

        {/* Password Strength Indicator */}
        {showStrength && value && passwordStrength && (
          <div className="mt-2 space-y-2">
            {/* Strength Bar */}
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={clsx(
                    "h-1 flex-1 rounded-full transition-colors duration-200",
                    level <= passwordStrength.score
                      ? getStrengthColor(passwordStrength.level)
                      : "bg-gray-200"
                  )}
                />
              ))}
            </div>

            {/* Strength Text and Feedback */}
            <div className="flex items-center justify-between text-xs">
              <span
                className={clsx(
                  "font-medium",
                  passwordStrength.level === "weak" && "text-danger-600",
                  passwordStrength.level === "medium" && "text-warning-600",
                  passwordStrength.level === "strong" && "text-success-600"
                )}
              >
                Độ mạnh: {getStrengthText(passwordStrength.level)}
              </span>

              <span className="text-gray-500">{passwordStrength.score}/5</span>
            </div>

            {/* Feedback Messages */}
            {passwordStrength.feedback.length > 0 && (
              <div className="text-xs text-gray-600">
                <p className="mb-1">Cần cải thiện:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {passwordStrength.feedback.map((feedback, index) => (
                    <li key={index}>{feedback}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
