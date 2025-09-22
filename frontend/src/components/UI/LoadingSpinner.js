import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const bounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
`;

const wave = keyframes`
  0%, 60%, 100% {
    transform: initial;
  }
  30% {
    transform: translateY(-15px);
  }
`;

const SpinnerContainer = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  ${props => props.fullScreen && css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.9);
    z-index: ${props => props.theme.zIndex.overlay};
  `}

  ${props => props.overlay && css`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 1;
  `}
`;

const SpinnerSizes = {
  xs: '16px',
  sm: '20px',
  md: '24px',
  lg: '32px',
  xl: '40px'
};

const SpinnerColors = {
  primary: props => props.theme.colors.primary.main,
  secondary: props => props.theme.colors.secondary.main,
  success: props => props.theme.colors.success.main,
  error: props => props.theme.colors.error.main,
  warning: props => props.theme.colors.warning.main,
  info: props => props.theme.colors.info.main,
  gray: props => props.theme.colors.gray[500]
};

const CircleSpinner = styled.div`
  width: ${props => SpinnerSizes[props.size] || SpinnerSizes.md};
  height: ${props => SpinnerSizes[props.size] || SpinnerSizes.md};
  border: 2px solid ${props => props.theme.colors.gray[200]};
  border-top: 2px solid ${props => SpinnerColors[props.color]?.(props) || SpinnerColors.primary(props)};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const DotsSpinner = styled.div`
  display: inline-flex;
  gap: 4px;
  align-items: center;
`;

const Dot = styled.div`
  width: ${props => parseInt(SpinnerSizes[props.size] || SpinnerSizes.md) / 3}px;
  height: ${props => parseInt(SpinnerSizes[props.size] || SpinnerSizes.md) / 3}px;
  border-radius: 50%;
  background-color: ${props => SpinnerColors[props.color]?.(props) || SpinnerColors.primary(props)};
  animation: ${bounce} 1.4s ease-in-out infinite both;
  
  &:nth-child(1) { animation-delay: -0.32s; }
  &:nth-child(2) { animation-delay: -0.16s; }
  &:nth-child(3) { animation-delay: 0s; }
`;

const PulseSpinner = styled.div`
  width: ${props => SpinnerSizes[props.size] || SpinnerSizes.md};
  height: ${props => SpinnerSizes[props.size] || SpinnerSizes.md};
  border-radius: 50%;
  background-color: ${props => SpinnerColors[props.color]?.(props) || SpinnerColors.primary(props)};
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const BarsSpinner = styled.div`
  display: inline-flex;
  gap: 2px;
  align-items: flex-end;
  height: ${props => SpinnerSizes[props.size] || SpinnerSizes.md};
`;

const Bar = styled.div`
  width: ${props => parseInt(SpinnerSizes[props.size] || SpinnerSizes.md) / 5}px;
  height: 100%;
  background-color: ${props => SpinnerColors[props.color]?.(props) || SpinnerColors.primary(props)};
  animation: ${wave} 1.2s ease-in-out infinite;
  
  &:nth-child(1) { animation-delay: 0s; }
  &:nth-child(2) { animation-delay: -1.1s; }
  &:nth-child(3) { animation-delay: -1.0s; }
  &:nth-child(4) { animation-delay: -0.9s; }
  &:nth-child(5) { animation-delay: -0.8s; }
`;

const RingSpinner = styled.div`
  display: inline-block;
  position: relative;
  width: ${props => SpinnerSizes[props.size] || SpinnerSizes.md};
  height: ${props => SpinnerSizes[props.size] || SpinnerSizes.md};
  
  div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    border: 2px solid ${props => SpinnerColors[props.color]?.(props) || SpinnerColors.primary(props)};
    border-radius: 50%;
    animation: ${spin} 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: ${props => SpinnerColors[props.color]?.(props) || SpinnerColors.primary(props)} transparent transparent transparent;
  }
  
  div:nth-child(1) { animation-delay: -0.45s; }
  div:nth-child(2) { animation-delay: -0.3s; }
  div:nth-child(3) { animation-delay: -0.15s; }
`;

const SpinnerText = styled.div`
  margin-top: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
`;

const LoadingSpinner = ({
  variant = 'circle',
  size = 'md',
  color = 'primary',
  text,
  fullScreen = false,
  overlay = false,
  className
}) => {
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <DotsSpinner>
            <Dot size={size} color={color} />
            <Dot size={size} color={color} />
            <Dot size={size} color={color} />
          </DotsSpinner>
        );
      
      case 'pulse':
        return <PulseSpinner size={size} color={color} />;
      
      case 'bars':
        return (
          <BarsSpinner size={size}>
            <Bar size={size} color={color} />
            <Bar size={size} color={color} />
            <Bar size={size} color={color} />
            <Bar size={size} color={color} />
            <Bar size={size} color={color} />
          </BarsSpinner>
        );
      
      case 'ring':
        return (
          <RingSpinner size={size} color={color}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </RingSpinner>
        );
      
      case 'circle':
      default:
        return <CircleSpinner size={size} color={color} />;
    }
  };

  return (
    <SpinnerContainer 
      fullScreen={fullScreen} 
      overlay={overlay}
      className={className}
    >
      <div>
        {renderSpinner()}
        {text && <SpinnerText>{text}</SpinnerText>}
      </div>
    </SpinnerContainer>
  );
};

const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    ${props => props.theme.colors.gray[200]} 0px,
    ${props => props.theme.colors.gray[100]} 40px,
    ${props => props.theme.colors.gray[200]} 80px
  );
  background-size: 200px;
  animation: shimmer 1.5s linear infinite;
  border-radius: ${props => props.theme.borderRadius.md};

  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }
`;

const SkeletonText = styled(SkeletonBase)`
  height: ${props => props.height || '16px'};
  width: ${props => props.width || '100%'};
  margin-bottom: ${props => props.theme.spacing[2]};
  
  ${props => props.lines > 1 && css`
    &::after {
      content: '';
      display: block;
      height: ${props.height || '16px'};
      width: ${props.lastLineWidth || '60%'};
      background: inherit;
      margin-top: ${props => props.theme.spacing[2]};
      border-radius: inherit;
    }
  `}
`;

const SkeletonCircle = styled(SkeletonBase)`
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  border-radius: 50%;
`;

const SkeletonRectangle = styled(SkeletonBase)`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '200px'};
`;

const Skeleton = {
  Text: SkeletonText,
  Circle: SkeletonCircle,
  Rectangle: SkeletonRectangle
};

const PageLoader = ({ text = "Đang tải..." }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      zIndex: 9999
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <LoadingSpinner size="lg" variant="circle" />
      <div style={{ marginTop: '16px', fontSize: '16px', color: '#666' }}>
        {text}
      </div>
    </div>
  </motion.div>
);

const InlineLoader = ({ text, size = 'sm' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <LoadingSpinner size={size} variant="circle" />
    {text && <span style={{ fontSize: '14px', color: '#666' }}>{text}</span>}
  </div>
);

export { LoadingSpinner, Skeleton, PageLoader, InlineLoader };
export default LoadingSpinner;


