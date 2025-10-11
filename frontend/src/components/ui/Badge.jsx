import React from 'react';

/**
 * Badge component for displaying status, labels, and counts
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} props.variant - Badge variant (primary, secondary, success, warning, error, info)
 * @param {string} props.size - Badge size (xs, sm, md, lg)
 * @param {boolean} props.dot - Whether to show as a dot badge
 * @param {boolean} props.outline - Whether to use outline style
 * @param {boolean} props.removable - Whether badge can be removed
 * @param {Function} props.onRemove - Remove handler
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} props.className - Additional CSS classes
 * @param {...any} props.rest - Other props
 * @returns {React.ReactElement} Badge component
 */
const Badge = ({
  children,
  variant = 'primary',
  size = 'sm',
  dot = false,
  outline = false,
  removable = false,
  onRemove,
  icon,
  className = '',
  ...rest
}) => {
  // Base classes
  const baseClasses = [
    'inline-flex',
    'items-center',
    'font-medium',
    'rounded-full',
    'transition-colors',
    'duration-200',
  ];

  // Size classes
  const sizeClasses = {
    xs: dot ? 'h-1.5 w-1.5' : 'px-2 py-0.5 text-xs',
    sm: dot ? 'h-2 w-2' : 'px-2.5 py-0.5 text-xs',
    md: dot ? 'h-2.5 w-2.5' : 'px-3 py-1 text-sm',
    lg: dot ? 'h-3 w-3' : 'px-4 py-1 text-sm',
  };

  // Variant classes for solid style
  const solidVariantClasses = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    error: 'bg-error-100 text-error-800',
    info: 'bg-blue-100 text-blue-800',
  };

  // Variant classes for outline style
  const outlineVariantClasses = {
    primary: 'border border-primary-200 text-primary-700 bg-white',
    secondary: 'border border-gray-200 text-gray-700 bg-white',
    success: 'border border-success-200 text-success-700 bg-white',
    warning: 'border border-warning-200 text-warning-700 bg-white',
    error: 'border border-error-200 text-error-700 bg-white',
    info: 'border border-blue-200 text-blue-700 bg-white',
  };

  // Dot variant classes
  const dotVariantClasses = {
    primary: 'bg-primary-500',
    secondary: 'bg-gray-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    info: 'bg-blue-500',
  };

  // Combine classes
  const variantClasses = dot 
    ? dotVariantClasses[variant]
    : outline 
      ? outlineVariantClasses[variant]
      : solidVariantClasses[variant];

  const classes = [
    ...baseClasses,
    sizeClasses[size],
    variantClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Handle remove click
  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove?.(e);
  };

  // Dot badge (small indicator)
  if (dot) {
    return <span className={classes} {...rest} />;
  }

  return (
    <span className={classes} {...rest}>
      {/* Icon */}
      {icon && (
        <span className={`${children ? 'mr-1' : ''} flex-shrink-0`}>
          {icon}
        </span>
      )}
      
      {/* Content */}
      {children && <span>{children}</span>}
      
      {/* Remove button */}
      {removable && (
        <button
          type="button"
          onClick={handleRemove}
          className={`
            ml-1 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center
            hover:bg-black hover:bg-opacity-10 focus:outline-none focus:bg-black focus:bg-opacity-10
            transition-colors duration-200
          `}
        >
          <span className="sr-only">Remove</span>
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

/**
 * StatusBadge component for common status displays
 */
export const StatusBadge = ({ status, label, className = '', ...rest }) => {
  const statusConfig = {
    active: { variant: 'success', children: 'Active' },
    inactive: { variant: 'secondary', children: 'Inactive' },
    pending: { variant: 'warning', children: 'Pending' },
    approved: { variant: 'success', children: 'Approved' },
    rejected: { variant: 'error', children: 'Rejected' },
    draft: { variant: 'secondary', children: 'Draft' },
    published: { variant: 'success', children: 'Published' },
    archived: { variant: 'secondary', children: 'Archived' },
    confirmed: { variant: 'success', children: 'Confirmed' },
    cancelled: { variant: 'error', children: 'Cancelled' },
    completed: { variant: 'success', children: 'Completed' },
    processing: { variant: 'warning', children: 'Processing' },
    failed: { variant: 'error', children: 'Failed' },
    available: { variant: 'success', children: 'Available' },
    occupied: { variant: 'warning', children: 'Occupied' },
    maintenance: { variant: 'secondary', children: 'Maintenance' },
    checked_in: { variant: 'info', children: 'Checked In' },
    checked_out: { variant: 'success', children: 'Checked Out' },
    unknown: { variant: 'secondary', children: 'Unknown' },
  };

  const config = statusConfig[status] || { variant: 'secondary', children: status || 'Unknown' };

  return (
    <Badge
      variant={config.variant}
      className={className}
      {...rest}
    >
      {label || config.children}
    </Badge>
  );
};

/**
 * CountBadge component for displaying counts
 */
export const CountBadge = ({ 
  count, 
  max = 99, 
  showZero = false, 
  className = '', 
  ...rest 
}) => {
  if (!showZero && (!count || count === 0)) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count;

  return (
    <Badge
      variant="error"
      size="xs"
      className={`ml-1 ${className}`}
      {...rest}
    >
      {displayCount}
    </Badge>
  );
};

/**
 * DotIndicator component for simple status indicators
 */
export const DotIndicator = ({ 
  status = 'secondary', 
  className = '', 
  label,
  ...rest 
}) => {
  const statusVariants = {
    online: 'success',
    offline: 'secondary',
    busy: 'warning',
    away: 'warning',
    error: 'error',
  };

  const variant = statusVariants[status] || status;

  return (
    <div className={`inline-flex items-center ${className}`}>
      <Badge variant={variant} dot {...rest} />
      {label && <span className="ml-2 text-sm text-gray-600">{label}</span>}
    </div>
  );
};

export { Badge };
export default Badge;
