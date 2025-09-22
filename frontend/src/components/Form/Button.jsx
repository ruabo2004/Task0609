import React from "react";
import { clsx } from "clsx";
import LoadingSpinner from "@components/Common/LoadingSpinner";

/**
 * Reusable Button Component
 * Supports various variants, sizes, and loading states
 */
const Button = ({
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  onClick,
  children,
  className = "",
  icon: Icon,
  rightIcon: RightIcon,
  fullWidth = false,
  ...props
}) => {
  const baseClasses = "btn";

  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "btn-outline",
    danger: "btn-danger",
    ghost: "text-gray-600 hover:text-gray-800 hover:bg-gray-100",
    link: "text-primary-600 hover:text-primary-800 underline p-0",
  };

  const sizeClasses = {
    sm: "btn-sm",
    md: "", // default size
    lg: "btn-lg",
  };

  const buttonClasses = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    {
      "w-full": fullWidth,
      "opacity-50 cursor-not-allowed": disabled || loading,
      relative: loading,
    },
    className
  );

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={buttonClasses}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" />
        </div>
      )}

      <span
        className={clsx("flex items-center justify-center gap-2", {
          invisible: loading,
        })}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {children}
        {RightIcon && <RightIcon className="h-4 w-4" />}
      </span>
    </button>
  );
};

export default Button;
