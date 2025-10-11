import React from 'react';

/**
 * Label component for form inputs
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Label content
 * @param {string} props.htmlFor - Associated input id
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.size - Label size (sm, md, lg)
 * @param {string} props.className - Additional CSS classes
 * @param {...any} rest - Other props
 * @returns {React.ReactElement} Label component
 */
export const Label = ({
  children,
  htmlFor,
  required = false,
  size = 'md',
  className = '',
  ...rest
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  // Base classes
  const baseClasses = [
    'block',
    'font-medium',
    'text-gray-700',
    'mb-1',
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label
      htmlFor={htmlFor}
      className={baseClasses}
      {...rest}
    >
      {children}
      {required && <span className="text-error-500 ml-1">*</span>}
    </label>
  );
};

export default Label;

