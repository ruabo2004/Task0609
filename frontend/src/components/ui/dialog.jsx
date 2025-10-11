import React from 'react';
import Modal from './Modal';

/**
 * Dialog component - alias for Modal for shadcn/ui compatibility
 */
export const Dialog = ({ open, onOpenChange, children, ...rest }) => (
  <Modal isOpen={open} onClose={() => onOpenChange?.(false)} {...rest}>
    {children}
  </Modal>
);

/**
 * DialogContent component
 */
export const DialogContent = ({ children, className = '', ...rest }) => (
  <div className={`bg-white rounded-lg shadow-xl ${className}`} {...rest}>
    {children}
  </div>
);

/**
 * DialogHeader component
 */
export const DialogHeader = ({ children, className = '', ...rest }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`} {...rest}>
    {children}
  </div>
);

/**
 * DialogTitle component
 */
export const DialogTitle = ({ children, className = '', ...rest }) => (
  <h3 className={`text-lg font-medium text-gray-900 ${className}`} {...rest}>
    {children}
  </h3>
);

/**
 * DialogDescription component
 */
export const DialogDescription = ({ children, className = '', ...rest }) => (
  <p className={`text-sm text-gray-500 mt-1 ${className}`} {...rest}>
    {children}
  </p>
);

/**
 * DialogFooter component
 */
export const DialogFooter = ({ children, className = '', ...rest }) => (
  <div className={`px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 ${className}`} {...rest}>
    {children}
  </div>
);

/**
 * DialogTrigger component
 */
export const DialogTrigger = ({ children, asChild, onClick, ...rest }) => {
  if (asChild) {
    return React.cloneElement(children, {
      onClick: (e) => {
        onClick?.(e);
        children.props.onClick?.(e);
      },
      ...rest
    });
  }

  return (
    <button onClick={onClick} {...rest}>
      {children}
    </button>
  );
};

export default Dialog;

