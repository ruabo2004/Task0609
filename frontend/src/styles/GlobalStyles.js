import styled, { createGlobalStyle, keyframes } from 'styled-components';

export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

export const slideInLeft = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

export const slideInRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

export const slideInUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const slideInDown = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const scaleIn = keyframes`
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

export const scaleOut = keyframes`
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.9);
    opacity: 0;
  }
`;

export const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
    transform: translate3d(0, -30px, 0);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0,-4px,0);
  }
`;

export const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
`;

export const ping = keyframes`
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
`;

export const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

export const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

export const shake = keyframes`
  10%, 90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%, 80% {
    transform: translate3d(2px, 0, 0);
  }
  30%, 50%, 70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%, 60% {
    transform: translate3d(4px, 0, 0);
  }
`;

export const GlobalStyle = createGlobalStyle`
  /* Reset & Base Styles */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    height: 100%;
    font-family: ${props => props.theme.typography.fontFamily.sans.join(', ')};
    font-size: ${props => props.theme.typography.fontSize.base};
    line-height: ${props => props.theme.typography.lineHeight.normal};
    color: ${props => props.theme.colors.text.primary};
    background-color: ${props => props.theme.colors.background.default};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    scroll-behavior: smooth;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    line-height: ${props => props.theme.typography.lineHeight.tight};
    color: ${props => props.theme.colors.text.primary};
    margin-bottom: ${props => props.theme.spacing[2]};
  }

  h1 {
    font-size: ${props => props.theme.typography.fontSize['4xl']};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
  }

  h2 {
    font-size: ${props => props.theme.typography.fontSize['3xl']};
  }

  h3 {
    font-size: ${props => props.theme.typography.fontSize['2xl']};
  }

  h4 {
    font-size: ${props => props.theme.typography.fontSize.xl};
  }

  h5 {
    font-size: ${props => props.theme.typography.fontSize.lg};
  }

  h6 {
    font-size: ${props => props.theme.typography.fontSize.base};
  }

  p {
    color: ${props => props.theme.colors.text.secondary};
    line-height: ${props => props.theme.typography.lineHeight.relaxed};
    margin-bottom: ${props => props.theme.spacing[4]};
  }

  a {
    color: ${props => props.theme.colors.primary.main};
    text-decoration: none;
    transition: color ${props => props.theme.transitions.duration[200]} ${props => props.theme.transitions.timingFunction.out};

    &:hover {
      color: ${props => props.theme.colors.primary.dark};
      text-decoration: underline;
    }

    &:focus {
      outline: 2px solid ${props => props.theme.colors.primary.main};
      outline-offset: 2px;
    }
  }

  /* Form Elements */
  button, input, select, textarea {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  input, select, textarea {
    border: 1px solid ${props => props.theme.colors.border.main};
    border-radius: ${props => props.theme.borderRadius.md};
    padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
    background-color: ${props => props.theme.colors.background.default};
    color: ${props => props.theme.colors.text.primary};
    transition: border-color ${props => props.theme.transitions.duration[200]} ${props => props.theme.transitions.timingFunction.out};

    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.primary.main};
      box-shadow: 0 0 0 3px ${props => props.theme.colors.primary[200]};
    }

    &::placeholder {
      color: ${props => props.theme.colors.text.disabled};
    }

    &:disabled {
      background-color: ${props => props.theme.colors.background.disabled};
      cursor: not-allowed;
    }
  }

  /* Scrollbar Styles */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background.muted};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.gray[400]};
    border-radius: ${props => props.theme.borderRadius.full};
    
    &:hover {
      background: ${props => props.theme.colors.gray[500]};
    }
  }

  /* Selection */
  ::selection {
    background-color: ${props => props.theme.colors.primary[200]};
    color: ${props => props.theme.colors.primary[900]};
  }

  /* Focus Styles */
  .focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary.main};
    outline-offset: 2px;
  }

  /* Animation Classes */
  .animate-fadeIn {
    animation: ${fadeIn} ${props => props.theme.transitions.duration[500]} ${props => props.theme.transitions.timingFunction.out};
  }

  .animate-fadeOut {
    animation: ${fadeOut} ${props => props.theme.transitions.duration[500]} ${props => props.theme.transitions.timingFunction.in};
  }

  .animate-slideInLeft {
    animation: ${slideInLeft} ${props => props.theme.transitions.duration[300]} ${props => props.theme.transitions.timingFunction.out};
  }

  .animate-slideInRight {
    animation: ${slideInRight} ${props => props.theme.transitions.duration[300]} ${props => props.theme.transitions.timingFunction.out};
  }

  .animate-slideInUp {
    animation: ${slideInUp} ${props => props.theme.transitions.duration[300]} ${props => props.theme.transitions.timingFunction.out};
  }

  .animate-slideInDown {
    animation: ${slideInDown} ${props => props.theme.transitions.duration[300]} ${props => props.theme.transitions.timingFunction.out};
  }

  .animate-scaleIn {
    animation: ${scaleIn} ${props => props.theme.transitions.duration[200]} ${props => props.theme.transitions.timingFunction.out};
  }

  .animate-scaleOut {
    animation: ${scaleOut} ${props => props.theme.transitions.duration[200]} ${props => props.theme.transitions.timingFunction.in};
  }

  .animate-spin {
    animation: ${spin} 1s linear infinite;
  }

  .animate-bounce {
    animation: ${bounce} 1s infinite;
  }

  .animate-pulse {
    animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .animate-ping {
    animation: ${ping} 1s cubic-bezier(0, 0, 0.2, 1) infinite;
  }

  .animate-float {
    animation: ${float} 3s ease-in-out infinite;
  }

  .animate-shake {
    animation: ${shake} 0.82s cubic-bezier(.36,.07,.19,.97) both;
  }

  /* Utility Classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }

  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .line-clamp-3 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  .shimmer {
    background: linear-gradient(
      90deg,
      ${props => props.theme.colors.gray[200]} 0px,
      ${props => props.theme.colors.gray[100]} 40px,
      ${props => props.theme.colors.gray[200]} 80px
    );
    background-size: 200px;
    animation: ${shimmer} 1.5s linear infinite;
  }

  /* Custom Properties for Dynamic Theming */
  :root {
    --primary-color: ${props => props.theme.colors.primary.main};
    --primary-dark: ${props => props.theme.colors.primary.dark};
    --primary-light: ${props => props.theme.colors.primary.light};
    --secondary-color: ${props => props.theme.colors.secondary.main};
    --success-color: ${props => props.theme.colors.success.main};
    --error-color: ${props => props.theme.colors.error.main};
    --warning-color: ${props => props.theme.colors.warning.main};
    --info-color: ${props => props.theme.colors.info.main};
    --background-color: ${props => props.theme.colors.background.default};
    --text-primary: ${props => props.theme.colors.text.primary};
    --text-secondary: ${props => props.theme.colors.text.secondary};
    --border-color: ${props => props.theme.colors.border.main};
    --shadow-sm: ${props => props.theme.colors.shadow.sm};
    --shadow-md: ${props => props.theme.colors.shadow.md};
    --shadow-lg: ${props => props.theme.colors.shadow.lg};
    --border-radius: ${props => props.theme.borderRadius.md};
    --border-radius-lg: ${props => props.theme.borderRadius.lg};
    --transition-duration: ${props => props.theme.transitions.duration[200]};
  }

  /* Print Styles */
  @media print {
    *, *::before, *::after {
      background: transparent !important;
      color: black !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }

    a, a:visited {
      text-decoration: underline;
    }

    abbr[title]::after {
      content: " (" attr(title) ")";
    }

    pre, blockquote {
      border: 1px solid #999;
      page-break-inside: avoid;
    }

    thead {
      display: table-header-group;
    }

    tr, img {
      page-break-inside: avoid;
    }

    p, h2, h3 {
      orphans: 3;
      widows: 3;
    }

    h2, h3 {
      page-break-after: avoid;
    }
  }

  /* Mobile Optimizations */
  @media (max-width: 768px) {
    html {
      font-size: 14px;
    }

    h1 {
      font-size: ${props => props.theme.typography.fontSize['2xl']};
    }

    h2 {
      font-size: ${props => props.theme.typography.fontSize.xl};
    }

    h3 {
      font-size: ${props => props.theme.typography.fontSize.lg};
    }

    /* Touch-friendly interactive elements */
    button, a, input, select, textarea {
      min-height: 44px;
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* High Contrast Mode */
  @media (prefers-contrast: high) {
    a {
      text-decoration: underline;
    }

    button {
      border: 1px solid;
    }
  }

  /* Dark Mode Preference */
  @media (prefers-color-scheme: dark) {
    :root {
      color-scheme: dark;
    }
  }
`;

export default GlobalStyle;


