import React, { forwardRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

const InputContainer = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const InputLabel = styled.label`
  display: block;
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
  
  ${props => props.required && css`
    &::after {
      content: ' *';
      color: ${props => props.theme.colors.error.main};
    }
  `}

  ${props => props.floating && css`
    position: absolute;
    top: 50%;
    left: ${props => props.theme.spacing[3]};
    transform: translateY(-50%);
    background-color: ${props => props.theme.colors.background.paper};
    padding: 0 ${props => props.theme.spacing[1]};
    transition: all ${props => props.theme.transitions.duration[200]} ${props => props.theme.transitions.timingFunction.out};
    pointer-events: none;
    z-index: 1;
    
    ${props.hasValue || props.focused ? css`
      top: 0;
      transform: translateY(-50%);
      font-size: ${props => props.theme.typography.fontSize.xs};
      color: ${props => props.theme.colors.primary.main};
    ` : ''}
  `}
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled(motion.input)`
  width: 100%;
  padding: ${props => {
    if (props.size === 'sm') return `${props.theme.spacing[2]} ${props.theme.spacing[3]}`;
    if (props.size === 'lg') return `${props.theme.spacing[4]} ${props.theme.spacing[4]}`;
    return `${props.theme.spacing[3]} ${props.theme.spacing[3]}`;
  }};
  
  ${props => props.leftIcon && css`
    padding-left: calc(${props.theme.spacing[10]} + ${props.theme.spacing[1]});
  `}

  ${props => props.rightIcon && css`
    padding-right: calc(${props.theme.spacing[10]} + ${props.theme.spacing[1]});
  `}

  border: 1px solid ${props => {
    if (props.error) return props.theme.colors.error.main;
    if (props.success) return props.theme.colors.success.main;
    return props.theme.colors.border.main;
  }};
  
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.background.default};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => {
    if (props.size === 'sm') return props.theme.typography.fontSize.sm;
    if (props.size === 'lg') return props.theme.typography.fontSize.lg;
    return props.theme.typography.fontSize.base;
  }};
  
  line-height: ${props => props.theme.typography.lineHeight.normal};
  transition: all ${props => props.theme.transitions.duration[200]} ${props => props.theme.transitions.timingFunction.out};
  outline: none;

  &::placeholder {
    color: ${props => props.theme.colors.text.disabled};
    opacity: 1;
  }

  &:focus {
    border-color: ${props => {
      if (props.error) return props.theme.colors.error.main;
      if (props.success) return props.theme.colors.success.main;
      return props.theme.colors.primary.main;
    }};
    
    box-shadow: 0 0 0 3px ${props => {
      if (props.error) return `${props.theme.colors.error[200]}`;
      if (props.success) return `${props.theme.colors.success[200]}`;
      return `${props.theme.colors.primary[200]}`;
    }};
  }

  &:disabled {
    background-color: ${props => props.theme.colors.background.disabled};
    color: ${props => props.theme.colors.text.disabled};
    cursor: not-allowed;
    border-color: ${props => props.theme.colors.border.light};
  }

  ${props => props.variant === 'filled' && css`
    background-color: ${props => props.theme.colors.background.muted};
    border: 1px solid transparent;
    
    &:focus {
      background-color: ${props => props.theme.colors.background.default};
      border-color: ${props => props.theme.colors.primary.main};
    }
  `}

  ${props => props.variant === 'borderless' && css`
    border: none;
    border-bottom: 2px solid ${props => props.theme.colors.border.main};
    border-radius: 0;
    padding-left: 0;
    padding-right: 0;
    background-color: transparent;
    
    &:focus {
      border-bottom-color: ${props => props.theme.colors.primary.main};
      box-shadow: none;
    }
  `}
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => {
    if (props.error) return props.theme.colors.error.main;
    if (props.success) return props.theme.colors.success.main;
    return props.theme.colors.text.secondary;
  }};
  
  ${props => props.position === 'left' && css`
    left: ${props => props.theme.spacing[3]};
  `}

  ${props => props.position === 'right' && css`
    right: ${props => props.theme.spacing[3]};
    cursor: ${props.clickable ? 'pointer' : 'default'};
    
    &:hover {
      color: ${props.clickable ? props.theme.colors.text.primary : 'inherit'};
    }
  `}

  svg {
    width: 20px;
    height: 20px;
  }
`;

const InputMessage = styled.div`
  margin-top: ${props => props.theme.spacing[1]};
  font-size: ${props => props.theme.typography.fontSize.xs};
  line-height: ${props => props.theme.typography.lineHeight.tight};
  
  ${props => props.type === 'error' && css`
    color: ${props => props.theme.colors.error.main};
  `}

  ${props => props.type === 'success' && css`
    color: ${props => props.theme.colors.success.main};
  `}

  ${props => props.type === 'help' && css`
    color: ${props => props.theme.colors.text.secondary};
  `}
`;

const CharacterCount = styled.div`
  position: absolute;
  bottom: -${props => props.theme.spacing[5]};
  right: 0;
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.secondary};
  
  ${props => props.isOverLimit && css`
    color: ${props => props.theme.colors.error.main};
  `}
`;

const StyledTextarea = styled(StyledInput).attrs({ as: 'textarea' })`
  resize: ${props => props.resize || 'vertical'};
  min-height: ${props => props.minHeight || '80px'};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
  padding-top: ${props => props.theme.spacing[3]};
  padding-bottom: ${props => props.theme.spacing[3]};
`;

const Input = forwardRef(({
  label,
  type = 'text',
  size = 'md',
  variant = 'default',
  placeholder,
  error,
  success,
  helpText,
  required = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onRightIconClick,
  floating = false,
  multiline = false,
  rows = 4,
  resize = 'vertical',
  maxLength,
  showCharacterCount = false,
  className,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  
  const currentValue = value !== undefined ? value : internalValue;
  const hasValue = currentValue && currentValue.length > 0;

  const handleChange = (e) => {
    if (maxLength && e.target.value.length > maxLength) {
      return;
    }
    
    if (value === undefined) {
      setInternalValue(e.target.value);
    }
    
    if (onChange) {
      onChange(e);
    }
  };

  const handleFocus = (e) => {
    setFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };

  const handleBlur = (e) => {
    setFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  const InputComponent = multiline ? StyledTextarea : StyledInput;

  const inputProps = {
    ref,
    type: multiline ? undefined : type,
    size,
    variant,
    placeholder: floating ? '' : placeholder,
    error,
    success,
    required,
    disabled,
    leftIcon: !!leftIcon,
    rightIcon: !!rightIcon,
    value: currentValue,
    onChange: handleChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    maxLength,
    className,
    ...(multiline && {
      rows,
      resize,
      multiline: true
    }),
    ...props
  };

  const characterCount = currentValue ? currentValue.length : 0;
  const isOverLimit = maxLength && characterCount > maxLength;

  return (
    <InputContainer>
      <InputLabel 
        floating={floating} 
        hasValue={hasValue} 
        focused={focused}
        required={required}
      >
        {label}
      </InputLabel>
      
      <InputWrapper>
        {leftIcon && (
          <IconWrapper position="left" error={error} success={success}>
            {leftIcon}
          </IconWrapper>
        )}
        
        <InputComponent {...inputProps} />
        
        {rightIcon && (
          <IconWrapper 
            position="right" 
            error={error} 
            success={success}
            clickable={!!onRightIconClick}
            onClick={onRightIconClick}
          >
            {rightIcon}
          </IconWrapper>
        )}
        
        {showCharacterCount && maxLength && (
          <CharacterCount isOverLimit={isOverLimit}>
            {characterCount}/{maxLength}
          </CharacterCount>
        )}
      </InputWrapper>
      
      {(error || success || helpText) && (
        <InputMessage type={error ? 'error' : success ? 'success' : 'help'}>
          {error || success || helpText}
        </InputMessage>
      )}
    </InputContainer>
  );
});

Input.displayName = 'Input';

export default Input;


