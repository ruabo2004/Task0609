import React, { forwardRef } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const Select = forwardRef(({
  label,
  error,
  helperText,
  size = 'md',
  required = false,
  disabled = false,
  fullWidth = true,
  className = '',
  wrapperClassName = '',
  id,
  children,
  options,
  placeholder,
  value,
  onChange,
  ...rest
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const baseSelectClasses = [
    'appearance-none',
    'block',
    'border',
    'rounded-lg',
    'shadow-sm',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-0',
    'transition-colors',
    'duration-200',
    'cursor-pointer',
    'pr-10',
    sizeClasses[size],
  ];

  const selectClasses = [
    ...baseSelectClasses,
    error
      ? [
          'border-red-300',
          'text-red-900',
          'focus:ring-red-500',
          'focus:border-red-500',
        ]
      : [
          'border-gray-300',
          'text-gray-900',
          'focus:ring-blue-500',
          'focus:border-blue-500',
        ],
    disabled ? ['bg-gray-50', 'text-gray-500', 'cursor-not-allowed'] : 'bg-white',
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

  // Handle onChange for options-based usage
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={wrapperClasses}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={selectClasses}
          disabled={disabled}
          value={value}
          onChange={handleChange}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
          }
          {...rest}
        >
          {/* If options prop is provided, render options from array */}
          {options ? (
            <>
              {placeholder && (
                <option value="" disabled={!value}>
                  {placeholder}
                </option>
              )}
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </>
          ) : (
            /* Otherwise render children */
            children
          )}
        </select>

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {error && (
        <p id={`${selectId}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={`${selectId}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export { Select };
export default Select;
