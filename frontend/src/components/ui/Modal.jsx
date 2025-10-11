import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from './Button';

/**
 * Modal component for displaying overlay content
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Function to call when modal should close
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.title - Modal title
 * @param {string} props.size - Modal size (sm, md, lg, xl, full)
 * @param {boolean} props.closeOnOverlayClick - Whether clicking overlay closes modal
 * @param {boolean} props.closeOnEscape - Whether escape key closes modal
 * @param {boolean} props.showCloseButton - Whether to show close button
 * @param {React.ReactNode} props.footer - Footer content
 * @param {string} props.className - Additional CSS classes for modal content
 * @param {string} props.overlayClassName - Additional CSS classes for overlay
 * @returns {React.ReactElement|null} Modal component
 */
const Modal = ({
  isOpen = false,
  onClose,
  children,
  title,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  footer,
  className = '',
  overlayClassName = '',
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently active element
      previousActiveElement.current = document.activeElement;
      
      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
      
      // Restore body scroll
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  // Handle focus trap
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${overlayClassName}`}
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay */}
      <div
        className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        onClick={handleOverlayClick}
      >
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        />

        {/* Center modal */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Modal panel */}
        <div
          ref={modalRef}
          className={`
            inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all 
            sm:my-8 sm:align-middle sm:w-full ${sizeClasses[size]} ${className}
          `}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between">
                {title && (
                  <h3
                    id="modal-title"
                    className="text-lg leading-6 font-medium text-gray-900"
                  >
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className={`bg-white px-4 pt-5 pb-4 sm:p-6 ${title || showCloseButton ? 'sm:pt-0' : ''}`}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render modal in portal
  return createPortal(modalContent, document.body);
};

/**
 * ConfirmModal component for confirmation dialogs
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  isLoading = false,
  ...rest
}) => {
  const handleConfirm = () => {
    onConfirm?.();
  };

  const footer = (
    <>
      <Button
        variant={confirmVariant}
        onClick={handleConfirm}
        loading={isLoading}
        disabled={isLoading}
      >
        {confirmText}
      </Button>
      <Button
        variant="secondary"
        onClick={onClose}
        disabled={isLoading}
        className="mr-3 sm:mr-0 sm:ml-3"
      >
        {cancelText}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      size="sm"
      {...rest}
    >
      <div className="mt-2">
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </Modal>
  );
};

/**
 * AlertModal component for simple alerts
 */
export const AlertModal = ({
  isOpen,
  onClose,
  title = 'Alert',
  message,
  buttonText = 'OK',
  variant = 'primary',
  ...rest
}) => {
  const footer = (
    <Button variant={variant} onClick={onClose}>
      {buttonText}
    </Button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      size="sm"
      {...rest}
    >
      <div className="mt-2">
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </Modal>
  );
};

export default Modal;
