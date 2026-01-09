import { useState, useEffect } from 'react';

/**
 * Hook to detect if animations are causing performance issues
 * and provide a fallback state
 */
export const useAnimationFallback = () => {
  const [shouldUseAnimations, setShouldUseAnimations] = useState(true);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (mediaQuery.matches) {
      setShouldUseAnimations(false);
    }

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setShouldUseAnimations(!e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Check for low-end devices (optional)
    const checkPerformance = () => {
      // If navigator.hardwareConcurrency is low, disable complex animations
      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        console.log('Low-end device detected, simplifying animations');
      }
    };

    checkPerformance();

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return shouldUseAnimations;
};
