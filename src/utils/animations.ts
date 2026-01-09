// Centralized animation configuration for consistent timing and easing

// Custom easing functions for premium feel
export const easings = {
  // Smooth and natural easing
  smooth: [0.25, 0.46, 0.45, 0.94] as const,
  // Bouncy spring-like easing
  spring: [0.34, 1.56, 0.64, 1] as const,
  // Sharp and snappy
  snappy: [0.4, 0, 0.2, 1] as const,
  // Gentle and soft
  gentle: [0.25, 0.1, 0.25, 1] as const,
  // Emphasized entrance
  emphasized: [0, 0, 0.2, 1] as const,
  // Emphasized exit
  emphasizedExit: [0.4, 0, 1, 1] as const,
};

// Standard durations for consistency
export const durations = {
  instant: 0,
  fast: 0.2,
  normal: 0.3,
  moderate: 0.4,
  slow: 0.6,
  verySlow: 0.8,
  extraSlow: 1.2,
};

// Page transition variants
export const pageTransition = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: durations.normal,
      ease: easings.snappy,
    }
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    scale: 0.98,
    transition: {
      duration: durations.normal,
      ease: easings.emphasizedExit,
    }
  }
};

// Fade in up animation
export const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: durations.slow,
      ease: easings.smooth,
    }
  },
};

// Scale in animation
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: durations.moderate,
      ease: easings.spring,
    }
  },
};

// Slide in from left
export const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: durations.moderate,
      ease: easings.smooth,
    }
  },
};

// Slide in from right
export const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: durations.moderate,
      ease: easings.smooth,
    }
  },
};

// Stagger children animation
export const staggerContainer = (staggerDelay = 0.05) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.1,
    },
  },
});

// Hover lift effect
export const hoverLift = {
  y: -8,
  transition: {
    duration: durations.fast,
    ease: easings.snappy,
  }
};

// Hover scale effect
export const hoverScale = (scale = 1.05) => ({
  scale,
  transition: {
    duration: durations.fast,
    ease: easings.snappy,
  }
});

// Tap scale effect
export const tapScale = (scale = 0.95) => ({
  scale,
  transition: {
    duration: durations.instant,
    ease: easings.snappy,
  }
});

// Rotate animation
export const rotate = (degrees: number, duration = durations.normal) => ({
  rotate: degrees,
  transition: {
    duration,
    ease: easings.smooth,
  }
});

// Pulse animation (for loading states)
export const pulse = {
  scale: [1, 1.05, 1],
  opacity: [1, 0.8, 1],
  transition: {
    duration: durations.extraSlow,
    repeat: Infinity,
    ease: easings.gentle,
  }
};

// Shimmer animation (for skeletons)
export const shimmer = {
  backgroundPosition: ['200% 0', '-200% 0'],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'linear',
  }
};

// Glow pulse animation
export const glowPulse = (color: string) => ({
  boxShadow: [
    `0 0 20px ${color}`,
    `0 0 40px ${color}`,
    `0 0 20px ${color}`,
  ],
  transition: {
    duration: durations.extraSlow,
    repeat: Infinity,
    ease: easings.gentle,
  }
});
