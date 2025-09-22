import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

const CardVariants = {
  elevated: css`
    box-shadow: ${props => props.theme.colors.shadow.lg};
    
    &:hover {
      box-shadow: ${props => props.theme.colors.shadow.xl};
      transform: translateY(-2px);
    }
  `,

  outlined: css`
    border: 1px solid ${props => props.theme.colors.border.main};
    box-shadow: none;
    
    &:hover {
      border-color: ${props => props.theme.colors.border.dark};
      box-shadow: ${props => props.theme.colors.shadow.md};
    }
  `,

  filled: css`
    background-color: ${props => props.theme.colors.background.muted};
    border: none;
    box-shadow: none;
    
    &:hover {
      background-color: ${props => props.theme.colors.gray[100]};
    }
  `,

  flat: css`
    background-color: transparent;
    border: none;
    box-shadow: none;
    
    &:hover {
      background-color: ${props => props.theme.colors.background.muted};
    }
  `
};

const CardSizes = {
  sm: css`
    padding: ${props => props.theme.spacing[3]};
    border-radius: ${props => props.theme.borderRadius.md};
  `,

  md: css`
    padding: ${props => props.theme.spacing[4]};
    border-radius: ${props => props.theme.borderRadius.lg};
  `,

  lg: css`
    padding: ${props => props.theme.spacing[6]};
    border-radius: ${props => props.theme.borderRadius.xl};
  `,

  xl: css`
    padding: ${props => props.theme.spacing[8]};
    border-radius: ${props => props.theme.borderRadius['2xl']};
  `
};

const StyledCard = styled(motion.div)`
  background-color: ${props => props.theme.colors.background.paper};
  transition: all ${props => props.theme.transitions.duration[300]} ${props => props.theme.transitions.timingFunction.out};
  position: relative;
  overflow: hidden;

  ${props => CardVariants[props.variant] || CardVariants.elevated}
  ${props => CardSizes[props.size] || CardSizes.md}

  ${props => props.interactive && css`
    cursor: pointer;
    user-select: none;
  `}

  ${props => props.fullWidth && css`
    width: 100%;
  `}

  ${props => props.height && css`
    height: ${props.height};
  `}

  ${props => props.gradient && css`
    background: linear-gradient(135deg, ${props.gradient.from} 0%, ${props.gradient.to} 100%);
  `}
`;

const CardHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing[4]};
  
  ${props => props.withDivider && css`
    padding-bottom: ${props => props.theme.spacing[4]};
    border-bottom: 1px solid ${props => props.theme.colors.border.light};
  `}
`;

const CardTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
  line-height: ${props => props.theme.typography.lineHeight.tight};
`;

const CardSubtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
`;

const CardContent = styled.div`
  flex: 1;
  
  ${props => props.scrollable && css`
    overflow-y: auto;
    max-height: ${props.maxHeight || '300px'};
    
    &::-webkit-scrollbar {
      width: 4px;
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

const CardFooter = styled.div`
  margin-top: ${props => props.theme.spacing[4]};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing[3]};
  
  ${props => props.withDivider && css`
    padding-top: ${props => props.theme.spacing[4]};
    border-top: 1px solid ${props => props.theme.colors.border.light};
  `}

  ${props => props.align === 'center' && css`
    justify-content: center;
  `}

  ${props => props.align === 'start' && css`
    justify-content: flex-start;
  `}

  ${props => props.align === 'end' && css`
    justify-content: flex-end;
  `}
`;

const CardActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  
  ${props => props.direction === 'column' && css`
    flex-direction: column;
    align-items: stretch;
  `}
`;

const CardImage = styled.div`
  width: 100%;
  height: ${props => props.height || '200px'};
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing[4]};
  position: relative;
  overflow: hidden;

  ${props => props.aspectRatio && css`
    aspect-ratio: ${props.aspectRatio};
    height: auto;
  `}

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
  }
`;

const CardBadge = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing[3]};
  right: ${props => props.theme.spacing[3]};
  background-color: ${props => props.theme.colors.primary.main};
  color: ${props => props.theme.colors.text.inverse};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  z-index: 1;

  ${props => props.variant === 'success' && css`
    background-color: ${props => props.theme.colors.success.main};
  `}

  ${props => props.variant === 'error' && css`
    background-color: ${props => props.theme.colors.error.main};
  `}

  ${props => props.variant === 'warning' && css`
    background-color: ${props => props.theme.colors.warning.main};
  `}

  ${props => props.variant === 'info' && css`
    background-color: ${props => props.theme.colors.info.main};
  `}
`;

const CardOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.7) 100%
  );
  display: flex;
  align-items: flex-end;
  padding: ${props => props.theme.spacing[4]};
  color: white;
  opacity: 0;
  transition: opacity ${props => props.theme.transitions.duration[300]} ${props => props.theme.transitions.timingFunction.out};

  ${StyledCard}:hover & {
    opacity: 1;
  }
`;

const Card = forwardRef(({
  children,
  variant = 'elevated',
  size = 'md',
  interactive = false,
  fullWidth = false,
  height,
  gradient,
  className,
  onClick,
  ...props
}, ref) => {
  const cardVariants = {
    initial: { scale: 1, y: 0 },
    whileHover: interactive ? { scale: 1.02, y: -2 } : undefined,
    whileTap: interactive ? { scale: 0.98 } : undefined
  };

  return (
    <StyledCard
      ref={ref}
      variant={variant}
      size={size}
      interactive={interactive}
      fullWidth={fullWidth}
      height={height}
      gradient={gradient}
      className={className}
      onClick={onClick}
      variants={cardVariants}
      initial="initial"
      whileHover="whileHover"
      whileTap="whileTap"
      {...props}
    >
      {children}
    </StyledCard>
  );
});

Card.displayName = 'Card';
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;
Card.Content = CardContent;
Card.Footer = CardFooter;
Card.Actions = CardActions;
Card.Image = CardImage;
Card.Badge = CardBadge;
Card.Overlay = CardOverlay;

export default Card;


