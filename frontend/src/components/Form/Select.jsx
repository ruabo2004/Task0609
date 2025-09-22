import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";

/**
 * Reusable Select Component
 */
const Select = forwardRef(
  (
    {
      name,
      label,
      value,
      onChange,
      onBlur,
      options = [],
      placeholder = "Chọn...",
      error,
      helperText,
      required = false,
      disabled = false,
      className = "",
      selectClassName = "",
      labelClassName = "",
      size = "md",
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-3 py-2 text-base",
      lg: "px-4 py-3 text-lg",
    };

    const selectClasses = clsx(
      "form-input appearance-none pr-10",
      sizeClasses[size],
      {
        error: error,
      },
      selectClassName
    );

    const labelClasses = clsx(
      "form-label",
      {
        "text-danger-600": error,
      },
      labelClassName
    );

    return (
      <div className={clsx("form-group", className)}>
        {label && (
          <label htmlFor={name} className={labelClasses}>
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            required={required}
            disabled={disabled}
            className={selectClasses}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown
              className={clsx(
                "h-5 w-5",
                error ? "text-danger-400" : "text-gray-400"
              )}
            />
          </div>
        </div>

        {error && <p className="form-error animate-slide-down">{error}</p>}

        {helperText && !error && (
          <p className="text-sm text-gray-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
