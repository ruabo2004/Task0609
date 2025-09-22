import React from 'react';
import { toast as reactToast, ToastContainer, Slide } from 'react-toastify';
import styled, { css } from 'styled-components';

const StyledToastContainer = styled(ToastContainer)`
  .Toastify__toast {
    background-color: ${props => props.theme.colors.background.paper};
    color: ${props => props.theme.colors.text.primary};
    border-radius: ${props => props.theme.borderRadius.lg};
    box-shadow: ${props => props.theme.colors.shadow.lg};
    border: 1px solid ${props => props.theme.colors.border.light};
    font-family: ${props => props.theme.typography.fontFamily.sans.join(', ')};
    font-size: ${props => props.theme.typography.fontSize.sm};
    line-height: ${props => props.theme.typography.lineHeight.normal};
    min-height: 60px;
    padding: ${props => props.theme.spacing[4]};
    margin-bottom: ${props => props.theme.spacing[2]};
  }

  .Toastify__toast--success {
    border-left: 4px solid ${props => props.theme.colors.success.main};
    
    .Toastify__toast-icon {
      color: ${props => props.theme.colors.success.main};
    }
  }

  .Toastify__toast--error {
    border-left: 4px solid ${props => props.theme.colors.error.main};
    
    .Toastify__toast-icon {
      color: ${props => props.theme.colors.error.main};
    }
  }

  .Toastify__toast--warning {
    border-left: 4px solid ${props => props.theme.colors.warning.main};
    
    .Toastify__toast-icon {
      color: ${props => props.theme.colors.warning.main};
    }
  }

  .Toastify__toast--info {
    border-left: 4px solid ${props => props.theme.colors.info.main};
    
    .Toastify__toast-icon {
      color: ${props => props.theme.colors.info.main};
    }
  }

  .Toastify__progress-bar {
    background: linear-gradient(
      90deg,
      ${props => props.theme.colors.primary.main} 0%,
      ${props => props.theme.colors.primary.light} 100%
    );
    height: 3px;
  }

  .Toastify__progress-bar--success {
    background: linear-gradient(
      90deg,
      ${props => props.theme.colors.success.main} 0%,
      ${props => props.theme.colors.success[400]} 100%
    );
  }

  .Toastify__progress-bar--error {
    background: linear-gradient(
      90deg,
      ${props => props.theme.colors.error.main} 0%,
      ${props => props.theme.colors.error[400]} 100%
    );
  }

  .Toastify__progress-bar--warning {
    background: linear-gradient(
      90deg,
      ${props => props.theme.colors.warning.main} 0%,
      ${props => props.theme.colors.warning[400]} 100%
    );
  }

  .Toastify__progress-bar--info {
    background: linear-gradient(
      90deg,
      ${props => props.theme.colors.info.main} 0%,
      ${props => props.theme.colors.info[400]} 100%
    );
  }

  .Toastify__close-button {
    color: ${props => props.theme.colors.text.secondary};
    opacity: 0.7;
    
    &:hover {
      opacity: 1;
    }
  }

  .Toastify__toast-icon {
    width: 20px;
    height: 20px;
    margin-right: ${props => props.theme.spacing[3]};
    flex-shrink: 0;
  }

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    .Toastify__toast-container {
      width: 100vw;
      padding: ${props => props.theme.spacing[2]};
      left: 0;
      margin: 0;
    }

    .Toastify__toast {
      margin-bottom: ${props => props.theme.spacing[1]};
      border-radius: ${props => props.theme.borderRadius.md};
    }
  }
`;

const ToastContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[3]};
`;

const ToastIcon = styled.div`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const ToastMessage = styled.div`
  flex: 1;
`;

const ToastTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  margin-bottom: ${props => props.theme.spacing[1]};
  color: ${props => props.theme.colors.text.primary};
`;

const ToastDescription = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
`;

const ToastAction = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary.main};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;
  padding: ${props => props.theme.spacing[1]} 0;
  margin-top: ${props => props.theme.spacing[2]};
  
  &:hover {
    color: ${props => props.theme.colors.primary.dark};
    text-decoration: underline;
  }
`;

const SuccessIcon = () => (
  <svg fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const ErrorIcon = () => (
  <svg fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

const WarningIcon = () => (
  <svg fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const InfoIcon = () => (
  <svg fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
  </svg>
);

const getIcon = (type) => {
  switch (type) {
    case 'success':
      return <SuccessIcon />;
    case 'error':
      return <ErrorIcon />;
    case 'warning':
      return <WarningIcon />;
    case 'info':
      return <InfoIcon />;
    default:
      return <InfoIcon />;
  }
};

const createToastContent = (message, title, action, type) => {
  if (typeof message === 'string' && !title && !action) {
    return message;
  }

  return (
    <ToastContent>
      <ToastIcon>
        {getIcon(type)}
      </ToastIcon>
      <ToastMessage>
        {title && <ToastTitle>{title}</ToastTitle>}
        <ToastDescription>
          {typeof message === 'string' ? message : message}
        </ToastDescription>
        {action && (
          <ToastAction onClick={action.onClick}>
            {action.label}
          </ToastAction>
        )}
      </ToastMessage>
    </ToastContent>
  );
};

const defaultOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  transition: Slide
};

const toast = {
  success: (message, options = {}) => {
    const { title, action, ...toastOptions } = options;
    return reactToast.success(
      createToastContent(message, title, action, 'success'),
      { ...defaultOptions, ...toastOptions }
    );
  },

  error: (message, options = {}) => {
    const { title, action, ...toastOptions } = options;
    return reactToast.error(
      createToastContent(message, title, action, 'error'),
      { 
        ...defaultOptions, 
        autoClose: 8000,
        ...toastOptions 
      }
    );
  },

  warning: (message, options = {}) => {
    const { title, action, ...toastOptions } = options;
    return reactToast.warning(
      createToastContent(message, title, action, 'warning'),
      { ...defaultOptions, ...toastOptions }
    );
  },

  info: (message, options = {}) => {
    const { title, action, ...toastOptions } = options;
    return reactToast.info(
      createToastContent(message, title, action, 'info'),
      { ...defaultOptions, ...toastOptions }
    );
  },

  loading: (message, options = {}) => {
    return reactToast.loading(message, {
      ...defaultOptions,
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      ...options
    });
  },

  promise: (promise, messages, options = {}) => {
    return reactToast.promise(
      promise,
      {
        pending: {
          render: createToastContent(messages.pending, null, null, 'info'),
          ...defaultOptions,
          autoClose: false,
          closeOnClick: false
        },
        success: {
          render: ({ data }) => createToastContent(
            typeof messages.success === 'function' ? messages.success(data) : messages.success,
            null, null, 'success'
          ),
          ...defaultOptions
        },
        error: {
          render: ({ data }) => createToastContent(
            typeof messages.error === 'function' ? messages.error(data) : messages.error,
            null, null, 'error'
          ),
          ...defaultOptions,
          autoClose: 8000
        }
      },
      options
    );
  },

  dismiss: (toastId) => {
    return reactToast.dismiss(toastId);
  },

  dismissAll: () => {
    return reactToast.dismiss();
  },

  update: (toastId, options) => {
    return reactToast.update(toastId, options);
  },

  isActive: (toastId) => {
    return reactToast.isActive(toastId);
  }
};

const CustomToastContainer = (props) => (
  <StyledToastContainer
    {...defaultOptions}
    {...props}
  />
);

export { toast, CustomToastContainer };
export default toast;


