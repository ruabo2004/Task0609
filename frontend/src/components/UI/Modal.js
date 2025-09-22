import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[4]};
  z-index: ${props => props.theme.zIndex.modal};
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled(motion.div)`
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.colors.shadow['2xl']};
  max-width: ${props => props.maxWidth || '500px'};
  max-height: 90vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;

  ${props => props.size === 'sm' && css`
    max-width: 400px;
  `}

  ${props => props.size === 'md' && css`
    max-width: 500px;
  `}

  ${props => props.size === 'lg' && css`
    max-width: 700px;
  `}

  ${props => props.size === 'xl' && css`
    max-width: 900px;
  `}

  ${props => props.size === 'full' && css`
    max-width: 95vw;
    max-height: 95vh;
  `}

  ${props => props.centered && css`
    margin: auto;
  `}

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    max-width: 95vw;
    max-height: 95vh;
    margin: ${props => props.theme.spacing[2]};
  }
`;

const ModalHeader = styled.div`
  padding: ${props => props.theme.spacing[6]};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;

  ${props => props.noPadding && css`
    padding: 0;
  `}

  ${props => props.noBorder && css`
    border-bottom: none;
  `}
`;

const ModalTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  line-height: ${props => props.theme.typography.lineHeight.tight};
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  padding: ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.duration[200]} ${props => props.theme.transitions.timingFunction.out};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;

  &:hover {
    background-color: ${props => props.theme.colors.background.muted};
    color: ${props => props.theme.colors.text.primary};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 2px;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ModalContent = styled.div`
  padding: ${props => props.theme.spacing[6]};
  flex: 1;
  overflow-y: auto;

  ${props => props.noPadding && css`
    padding: 0;
  `}

  ${props => props.scrollable && css`
    max-height: 60vh;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: ${props => props.theme.colors.background.muted};
    }
    
    &::-webkit-scrollbar-thumb {
      background: ${props => props.theme.colors.gray[400]};
      border-radius: ${props => props.theme.borderRadius.full};
    }
  `}
`;

const ModalFooter = styled.div`
  padding: ${props => props.theme.spacing[6]};
  border-top: 1px solid ${props => props.theme.colors.border.light};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing[3]};
  flex-shrink: 0;

  ${props => props.noPadding && css`
    padding: 0;
  `}

  ${props => props.noBorder && css`
    border-top: none;
  `}

  ${props => props.justify === 'start' && css`
    justify-content: flex-start;
  `}

  ${props => props.justify === 'center' && css`
    justify-content: center;
  `}

  ${props => props.justify === 'between' && css`
    justify-content: space-between;
  `}

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: stretch;
    
    button {
      width: 100%;
    }
  }
`;

const overlayVariants = {
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.2
    }
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3
    }
  }
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    transition: {
      duration: 0.2
    }
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      type: "spring",
      damping: 25,
      stiffness: 500
    }
  }
};

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  centered = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  overlayClassName,
  ...props
}) => {
  const modalRef = useRef(null);

  useHotkeys('Escape', () => {
    if (closeOnEscape && isOpen) {
      onClose();
    }
  }, [closeOnEscape, isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const activeElement = document.activeElement;
      
      setTimeout(() => {
        if (modalRef.current) {
          const focusableElement = modalRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElement) {
            focusableElement.focus();
          }
        }
      }, 100);

      return () => {
        document.body.style.overflow = 'unset';
        if (activeElement && activeElement.focus) {
          activeElement.focus();
        }
      };
    }
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          className={overlayClassName}
          onClick={handleOverlayClick}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <ModalContainer
            ref={modalRef}
            size={size}
            centered={centered}
            className={className}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            {...props}
          >
            {(title || showCloseButton) && (
              <ModalHeader>
                {title && (
                  <ModalTitle id="modal-title">{title}</ModalTitle>
                )}
                {showCloseButton && (
                  <ModalCloseButton onClick={onClose} aria-label="Đóng">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </ModalCloseButton>
                )}
              </ModalHeader>
            )}
            {children}
          </ModalContainer>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;
Modal.CloseButton = ModalCloseButton;

export default Modal;


