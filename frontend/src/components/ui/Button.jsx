import React from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

/**
 * Button component with multiple variants and states
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.variant - Button variant (primary, secondary, success, warning, error, ghost)
 * @param {string} props.size - Button size (xs, sm, md, lg, xl)
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.loading - Whether button is in loading state
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {string} props.to - Router link destination (makes button a Link)
 * @param {string} props.href - External link destination (makes button an anchor)
 * @param {React.ReactNode} props.leftIcon - Icon to show on the left
 * @param {React.ReactNode} props.rightIcon - Icon to show on the right
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler
 * @param {...any} props.rest - Other props to pass through
 * @returns {React.ReactElement} Button component
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  to,
  href,
  leftIcon,
  rightIcon,
  className = '',
  onClick,
  type = 'button',
  ...rest
}) => {
  // Base classes
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'border',
    'font-medium',
    'rounded-md',
    'shadow-sm',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'transition-all',
    'duration-200',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
  ];

  // Size classes
  const sizeClasses = {
    xs: ['px-2.5', 'py-1.5', 'text-xs'],
    sm: ['px-3', 'py-2', 'text-sm', 'leading-4'],
    md: ['px-4', 'py-2', 'text-sm'],
    lg: ['px-4', 'py-2', 'text-base'],
    xl: ['px-6', 'py-3', 'text-base'],
  };

  // Variant classes
  const variantClasses = {
    primary: [
      'text-white',
      'bg-primary-600',
      'border-transparent',
      'hover:bg-primary-700',
      'focus:ring-primary-500',
      'active:bg-primary-800',
    ],
    secondary: [
      'text-gray-700',
      'bg-white',
      'border-gray-300',
      'hover:bg-gray-50',
      'focus:ring-primary-500',
      'active:bg-gray-100',
    ],
    success: [
      'text-white',
      'bg-success-600',
      'border-transparent',
      'hover:bg-success-700',
      'focus:ring-success-500',
      'active:bg-success-800',
    ],
    warning: [
      'text-white',
      'bg-warning-600',
      'border-transparent',
      'hover:bg-warning-700',
      'focus:ring-warning-500',
      'active:bg-warning-800',
    ],
    error: [
      'text-white',
      'bg-error-600',
      'border-transparent',
      'hover:bg-error-700',
      'focus:ring-error-500',
      'active:bg-error-800',
    ],
    ghost: [
      'text-gray-700',
      'bg-transparent',
      'border-transparent',
      'hover:bg-gray-100',
      'focus:ring-primary-500',
      'active:bg-gray-200',
    ],
    outline: [
      'text-primary-600',
      'bg-transparent',
      'border-primary-600',
      'hover:bg-primary-50',
      'focus:ring-primary-500',
      'active:bg-primary-100',
    ],
  };

  // Combine all classes
  const classes = [
    ...baseClasses,
    ...(sizeClasses[size] || sizeClasses.md),
    ...(variantClasses[variant] || variantClasses.primary),
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Content with loading state
  const content = (
    <>
      {loading && (
        <LoadingSpinner 
          size="sm" 
          className="mr-2"
          color={variant === 'secondary' || variant === 'ghost' ? 'secondary' : 'white'}
        />
      )}
      {!loading && leftIcon && (
        <span className="mr-2 flex-shrink-0">{leftIcon}</span>
      )}
      <span className={loading ? 'opacity-70' : ''}>{children}</span>
      {!loading && rightIcon && (
        <span className="ml-2 flex-shrink-0">{rightIcon}</span>
      )}
    </>
  );

  // Handle different button types
  if (to) {
    // Router Link
    return (
      <Link
        to={to}
        className={classes}
        onClick={disabled || loading ? (e) => e.preventDefault() : onClick}
        {...rest}
      >
        {content}
      </Link>
    );
  }

  if (href) {
    // External Link
    return (
      <a
        href={href}
        className={classes}
        onClick={disabled || loading ? (e) => e.preventDefault() : onClick}
        {...rest}
      >
        {content}
      </a>
    );
  }

  // Regular Button
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {content}
    </button>
  );
};

export { Button };
export default Button;
