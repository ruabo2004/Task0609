import React from 'react';

/**
 * Separator component for visual separation
 * @param {Object} props - Component props
 * @param {string} props.orientation - Orientation (horizontal, vertical)
 * @param {string} props.className - Additional CSS classes
 * @param {...any} rest - Other props
 * @returns {React.ReactElement} Separator component
 */
export const Separator = ({
  orientation = 'horizontal',
  className = '',
  ...rest
}) => {
  const baseClasses = 'bg-gray-200';
  
  const orientationClasses = {
    horizontal: 'h-px w-full',
    vertical: 'w-px h-full',
  };

  const classes = [
    baseClasses,
    orientationClasses[orientation],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes} {...rest} />;
};

export default Separator;

