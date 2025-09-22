import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

const ButtonVariants = {
  primary: css`
    background-color: ${props => props.theme.colors.primary.main};
    color: ${props => props.theme.colors.text.inverse};
    border: 1px solid ${props => props.theme.colors.primary.main};

    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.primary.dark};
      border-color: ${props => props.theme.colors.primary.dark};
      transform: translateY(-1px);
      box-shadow: ${props => props.theme.colors.shadow.md};
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: ${props => props.theme.colors.shadow.sm};
    }
  `,

  secondary: css`
    background-color: ${props => props.theme.colors.background.default};
    color: ${props => props.theme.colors.primary.main};
    border: 1px solid ${props => props.theme.colors.primary.main};

    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.primary[50]};
      transform: translateY(-1px);
      box-shadow: ${props => props.theme.colors.shadow.md};
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: ${props => props.theme.colors.shadow.sm};
    }
  `,

  outline: css`
    background-color: transparent;
    color: ${props => props.theme.colors.text.primary};
    border: 1px solid ${props => props.theme.colors.border.main};

    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.background.muted};
      border-color: ${props => props.theme.colors.border.dark};
      transform: translateY(-1px);
    }
  `,

  ghost: css`
    background-color: transparent;
    color: ${props => props.theme.colors.text.primary};
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.background.muted};
      transform: translateY(-1px);
    }
  `,

  success: css`
    background-color: ${props => props.theme.colors.success.main};
    color: ${props => props.theme.colors.text.inverse};
    border: 1px solid ${props => props.theme.colors.success.main};

    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.success[600]};
      border-color: ${props => props.theme.colors.success[600]};
      transform: translateY(-1px);
      box-shadow: ${props => props.theme.colors.shadow.md};
    }
  `,

  error: css`
    background-color: ${props => props.theme.colors.error.main};
    color: ${props => props.theme.colors.text.inverse};
    border: 1px solid ${props => props.theme.colors.error.main};

    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.error[600]};
      border-color: ${props => props.theme.colors.error[600]};
      transform: translateY(-1px);
      box-shadow: ${props => props.theme.colors.shadow.md};
    }
  `,

  warning: css`
    background-color: ${props => props.theme.colors.warning.main};
    color: ${props => props.theme.colors.text.inverse};
    border: 1px solid ${props => props.theme.colors.warning.main};

    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.warning[600]};
      border-color: ${props => props.theme.colors.warning[600]};
      transform: translateY(-1px);
      box-shadow: ${props => props.theme.colors.shadow.md};
    }
  `
};

const ButtonSizes = {
  xs: css`
    padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
    font-size: ${props => props.theme.typography.fontSize.xs};
    border-radius: ${props => props.theme.borderRadius.sm};
  `,

  sm: css`
    padding: ${props => props.theme.spacing[1.5]} ${props => props.theme.spacing[3]};
    font-size: ${props => props.theme.typography.fontSize.sm};
    border-radius: ${props => props.theme.borderRadius.md};
  `,

  md: css`
    padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
    font-size: ${props => props.theme.typography.fontSize.base};
    border-radius: ${props => props.theme.borderRadius.md};
  `,

  lg: css`
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
    font-size: ${props => props.theme.typography.fontSize.lg};
    border-radius: ${props => props.theme.borderRadius.lg};
  `,

  xl: css`
    padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[8]};
    font-size: ${props => props.theme.typography.fontSize.xl};
    border-radius: ${props => props.theme.borderRadius.xl};
  `
};

const StyledButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
  font-family: ${props => props.theme.typography.fontFamily.sans.join(', ')};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  line-height: ${props => props.theme.typography.lineHeight.tight};
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: all ${props => props.theme.transitions.duration[200]} ${props => props.theme.transitions.timingFunction.out};
  position: relative;
  overflow: hidden;

  ${props => ButtonVariants[props.variant] || ButtonVariants.primary}
  ${props => ButtonSizes[props.size] || ButtonSizes.md}

  ${props => props.fullWidth && css`
    width: 100%;
  `}

  ${props => props.rounded && css`
    border-radius: ${props.theme.borderRadius.full};
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 2px;
  }

  ${props => props.loading && css`
    color: transparent;
    pointer-events: none;
  `}
`;

const LoadingSpinner = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
`;

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
`;

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  rounded = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className,
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const buttonVariants = {
    initial: { scale: 1 },
    whileTap: { scale: 0.98 },
    whileHover: { scale: 1.02 }
  };

  const handleClick = (event) => {
    if (loading || disabled) {
      event.preventDefault();
      return;
    }
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <StyledButton
      ref={ref}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      rounded={rounded}
      loading={loading}
      disabled={disabled || loading}
      className={className}
      onClick={handleClick}
      type={type}
      variants={buttonVariants}
      initial="initial"
      whileTap="whileTap"
      whileHover="whileHover"
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && leftIcon && (
        <IconWrapper>{leftIcon}</IconWrapper>
      )}
      {children}
      {!loading && rightIcon && (
        <IconWrapper>{rightIcon}</IconWrapper>
      )}
    </StyledButton>
  );
});

Button.displayName = 'Button';

export default Button;


