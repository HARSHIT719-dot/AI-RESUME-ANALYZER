import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';
import { 
  fadeInUp, 
  scaleIn, 
  slideInLeft, 
  slideInRight,
  easings,
  durations,
  staggerContainer 
} from '../../utils/animations';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: boolean;
  staggerDelay?: number;
  animation?: 'fadeInUp' | 'fadeIn' | 'slideInLeft' | 'slideInRight' | 'scaleIn';
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = '',
  delay = 0,
  stagger = false,
  staggerDelay = 0.05,
  animation = 'fadeInUp',
}) => {
  const animations: Record<string, Variants> = {
    fadeInUp,
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: {
          duration: durations.moderate,
          ease: easings.smooth,
        }
      },
    },
    slideInLeft,
    slideInRight,
    scaleIn,
  };

  const containerVariants: Variants = stagger 
    ? staggerContainer(staggerDelay)
    : animations[animation];

  // Add delay to the animation if specified
  const animationWithDelay = delay > 0 ? {
    ...animations[animation],
    visible: {
      ...animations[animation].visible,
      transition: {
        ...(animations[animation].visible as any).transition,
        delay,
      }
    }
  } : animations[animation];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger ? containerVariants : animationWithDelay}
      className={className}
    >
      {stagger ? (
        <>
          {Array.isArray(children)
            ? children.map((child, index) => (
                <motion.div key={index} variants={animations[animation]}>
                  {child}
                </motion.div>
              ))
            : children}
        </>
      ) : (
        children
      )}
    </motion.div>
  );
};
