import React from 'react';

/**
 * Card component for displaying content in a styled container
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.title - Card title
 * @param {React.ReactNode} props.header - Custom header content
 * @param {React.ReactNode} props.footer - Footer content
 * @param {string} props.variant - Card variant (default, elevated, outlined)
 * @param {string} props.padding - Padding size (none, sm, md, lg, xl)
 * @param {boolean} props.hoverable - Whether card has hover effects
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler for clickable cards
 * @param {...any} props.rest - Other props to pass through
 * @returns {React.ReactElement} Card component
 */
const Card = ({
  children,
  title,
  header,
  footer,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className = '',
  onClick,
  ...rest
}) => {
  // Base classes
  const baseClasses = [
    'bg-white',
    'rounded-lg',
    'transition-all',
    'duration-200',
  ];

  // Variant classes
  const variantClasses = {
    default: ['shadow'],
    elevated: ['shadow-lg'],
    outlined: ['border', 'border-gray-200', 'shadow-sm'],
  };

  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  // Header padding classes (when there's a title or custom header)
  const headerPaddingClasses = {
    none: '',
    sm: 'px-3 pt-3',
    md: 'px-4 pt-4',
    lg: 'px-6 pt-6',
    xl: 'px-8 pt-8',
  };

  // Content padding classes (when there's a header)
  const contentPaddingClasses = {
    none: '',
    sm: 'px-3 pb-3',
    md: 'px-4 pb-4',
    lg: 'px-6 pb-6',
    xl: 'px-8 pb-8',
  };

  // Footer padding classes
  const footerPaddingClasses = {
    none: '',
    sm: 'px-3 pb-3',
    md: 'px-4 pb-4',
    lg: 'px-6 pb-6',
    xl: 'px-8 pb-8',
  };

  // Hover classes
  const hoverClasses = hoverable ? [
    'cursor-pointer',
    'hover:shadow-lg',
    'hover:scale-[1.02]',
    'active:scale-[0.98]',
  ] : [];

  // Clickable classes
  const clickableClasses = onClick ? [
    'cursor-pointer',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-primary-500',
    'focus:ring-offset-2',
  ] : [];

  // Combine all classes
  const cardClasses = [
    ...baseClasses,
    ...variantClasses[variant],
    ...hoverClasses,
    ...clickableClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Determine if we need custom layout for header/footer
  const hasCustomLayout = title || header || footer;

  // Handle card click
  const handleClick = onClick ? (e) => {
    e.stopPropagation();
    onClick(e);
  } : undefined;

  const handleKeyDown = onClick ? (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(e);
    }
  } : undefined;

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      {...rest}
    >
      {hasCustomLayout ? (
        <>
          {/* Header */}
          {(title || header) && (
            <div className={headerPaddingClasses[padding]}>
              {header || (
                <h3 className="text-lg font-medium text-gray-900">
                  {title}
                </h3>
              )}
            </div>
          )}

          {/* Content */}
          <div className={
            (title || header) && footer 
              ? contentPaddingClasses[padding]
              : (title || header) 
                ? contentPaddingClasses[padding]
                : footer
                  ? headerPaddingClasses[padding]
                  : paddingClasses[padding]
          }>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className={`border-t border-gray-200 ${footerPaddingClasses[padding]}`}>
              {footer}
            </div>
          )}
        </>
      ) : (
        <div className={paddingClasses[padding]}>
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * CardHeader component for consistent card headers
 */
export const CardHeader = ({ children, className = '', ...rest }) => (
  <div className={`flex items-center justify-between ${className}`} {...rest}>
    {children}
  </div>
);

/**
 * CardTitle component for consistent card titles
 */
export const CardTitle = ({ children, className = '', ...rest }) => (
  <h3 className={`text-lg font-medium text-gray-900 ${className}`} {...rest}>
    {children}
  </h3>
);

/**
 * CardContent component for card body content
 */
export const CardContent = ({ children, className = '', ...rest }) => (
  <div className={`text-gray-600 ${className}`} {...rest}>
    {children}
  </div>
);

/**
 * CardActions component for action buttons in cards
 */
export const CardActions = ({ children, className = '', align = 'right', ...rest }) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div className={`flex items-center gap-2 ${alignClasses[align]} ${className}`} {...rest}>
      {children}
    </div>
  );
};

export { Card };
export default Card;
