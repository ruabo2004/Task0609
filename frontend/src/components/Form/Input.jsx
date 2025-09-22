import React, { forwardRef } from "react";
import { clsx } from "clsx";

/**
 * Reusable Input Component
 * Supports various input types with consistent styling and validation
 */
const Input = forwardRef(
  (
    {
      type = "text",
      name,
      label,
      placeholder,
      value,
      onChange,
      onBlur,
      error,
      helperText,
      required = false,
      disabled = false,
      autoComplete,
      icon: Icon,
      rightIcon: RightIcon,
      onRightIconClick,
      className = "",
      inputClassName = "",
      labelClassName = "",
      size = "md",
      ...props
    },
    ref
  ) => {
    const inputSizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-3 py-2 text-base",
      lg: "px-4 py-3 text-lg",
    };

    const inputClasses = clsx(
      "form-input",
      inputSizes[size],
      {
        "pl-10": Icon,
        "pr-10": RightIcon,
        error: error,
      },
      inputClassName
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
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon
                className={clsx(
                  "h-5 w-5",
                  error ? "text-danger-400" : "text-gray-400"
                )}
              />
            </div>
          )}

          <input
            ref={ref}
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            autoComplete={autoComplete}
            className={inputClasses}
            {...props}
          />

          {RightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={onRightIconClick}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                disabled={disabled}
              >
                <RightIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {error && <p className="form-error animate-slide-down">{error}</p>}

        {helperText && !error && (
          <p className="text-sm text-gray-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
