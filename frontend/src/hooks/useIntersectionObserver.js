import { useEffect, useRef, useState } from 'react';

export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef();

  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px',
    triggerOnce: false,
    ...options
  };

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        setIsIntersecting(isElementIntersecting);
        
        if (isElementIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }

        if (defaultOptions.triggerOnce && isElementIntersecting) {
          observer.unobserve(element);
        }
      },
      {
        threshold: defaultOptions.threshold,
        rootMargin: defaultOptions.rootMargin,
        root: defaultOptions.root
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [defaultOptions.threshold, defaultOptions.rootMargin, defaultOptions.triggerOnce, hasIntersected, defaultOptions.root]);

  return {
    ref,
    isIntersecting,
    hasIntersected
  };
};

export const useAnimateOnScroll = (animationVariants, options = {}) => {
  const { ref, isIntersecting, hasIntersected } = useIntersectionObserver({
    triggerOnce: true,
    ...options
  });

  const controls = {
    initial: animationVariants.hidden || 'hidden',
    animate: (hasIntersected || isIntersecting) ? 
      (animationVariants.visible || 'visible') : 
      (animationVariants.hidden || 'hidden')
  };

  return {
    ref,
    controls,
    isIntersecting,
    hasIntersected
  };
};

export const useLazyLoad = (options = {}) => {
  const [loaded, setLoaded] = useState(false);
  const { ref, isIntersecting } = useIntersectionObserver({
    triggerOnce: true,
    ...options
  });

  useEffect(() => {
    if (isIntersecting && !loaded) {
      setLoaded(true);
    }
  }, [isIntersecting, loaded]);

  return {
    ref,
    loaded,
    isIntersecting
  };
};

export default useIntersectionObserver;


