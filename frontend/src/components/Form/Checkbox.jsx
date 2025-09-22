import React, { forwardRef } from "react";
import { Check } from "lucide-react";
import { clsx } from "clsx";

/**
 * Reusable Checkbox Component
 */
const Checkbox = forwardRef(
  (
    {
      name,
      label,
      checked = false,
      onChange,
      onBlur,
      error,
      required = false,
      disabled = false,
      className = "",
      checkboxClassName = "",
      labelClassName = "",
      size = "md",
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    };

    const checkboxClasses = clsx(
      "rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 transition-colors duration-200",
      sizeClasses[size],
      {
        "border-danger-500": error,
        "opacity-50 cursor-not-allowed": disabled,
      },
      checkboxClassName
    );

    const labelClasses = clsx(
      "text-sm text-gray-700 cursor-pointer",
      {
        "text-danger-600": error,
        "opacity-50 cursor-not-allowed": disabled,
      },
      labelClassName
    );

    return (
      <div className={clsx("flex items-start", className)}>
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            id={name}
            name={name}
            checked={checked}
            onChange={onChange}
            onBlur={onBlur}
            required={required}
            disabled={disabled}
            className={checkboxClasses}
            {...props}
          />
        </div>

        {label && (
          <div className="ml-3">
            <label htmlFor={name} className={labelClasses}>
              {label}
              {required && <span className="text-danger-500 ml-1">*</span>}
            </label>

            {error && (
              <p className="text-sm text-danger-600 mt-1 animate-slide-down">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
