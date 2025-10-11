import React, { forwardRef } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

/**
 * Input component with validation states and icons
 * @param {Object} props - Component props
 * @param {string} props.label - Input label
 * @param {string} props.error - Error message
 * @param {string} props.helperText - Helper text below input
 * @param {React.ReactNode} props.leftIcon - Icon on the left side
 * @param {React.ReactNode} props.rightIcon - Icon on the right side
 * @param {string} props.size - Input size (sm, md, lg)
 * @param {boolean} props.required - Whether input is required
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {boolean} props.fullWidth - Whether input takes full width
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.wrapperClassName - CSS classes for wrapper div
 * @param {...any} props.rest - Other input props
 * @returns {React.ReactElement} Input component
 */
const Input = forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  size = 'md',
  required = false,
  disabled = false,
  fullWidth = true,
  className = '',
  wrapperClassName = '',
  id,
  ...rest
}, ref) => {
  // Generate unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  // Base input classes
  const baseInputClasses = [
    'appearance-none',
    'block',
    'border',
    'rounded-md',
    'shadow-sm',
    'placeholder-gray-400',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-0',
    'transition-colors',
    'duration-200',
    sizeClasses[size],
  ];

  // State-dependent classes
  const inputClasses = [
    ...baseInputClasses,
    error
      ? [
          'border-error-300',
          'text-error-900',
          'focus:ring-error-500',
          'focus:border-error-500',
        ]
      : [
          'border-gray-300',
          'text-gray-900',
          'focus:ring-primary-500',
          'focus:border-primary-500',
        ],
    disabled ? ['bg-gray-50', 'text-gray-500', 'cursor-not-allowed'] : 'bg-white',
    leftIcon ? 'pl-10' : '',
    rightIcon || error ? 'pr-10' : '',
    fullWidth ? 'w-full' : '',
    className,
  ]
    .flat()
    .filter(Boolean)
    .join(' ');

  const wrapperClasses = [
    fullWidth ? 'w-full' : '',
    wrapperClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 sm:text-sm">{leftIcon}</span>
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...rest}
        />

        {/* Right Icon or Error Icon */}
        {(rightIcon || error) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {error ? (
              <ExclamationCircleIcon className="h-5 w-5 text-error-500" />
            ) : (
              <span className="text-gray-400 sm:text-sm">{rightIcon}</span>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-error-600">
          {error}
        </p>
      )}

      {/* Helper Text */}
      {!error && helperText && (
        <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
export default Input;
