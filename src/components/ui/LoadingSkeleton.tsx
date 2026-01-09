import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  variant?: 'card' | 'score' | 'list';
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'card',
  count = 1,
  className = '',
}) => {
  const shimmerVariants = {
    initial: { backgroundPosition: '-200% 0' },
    animate: { backgroundPosition: '200% 0' },
  };

  const shimmerTransition = {
    duration: 2,
    repeat: Infinity,
    ease: 'linear',
  };

  const shimmerStyle = {
    background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(139,92,246,0.15) 50%, rgba(255,255,255,0.03) 100%)',
    backgroundSize: '200% 100%',
  };

  if (variant === 'score') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`} data-testid="loading-skeleton">
        {/* Circular score skeleton */}
        <motion.div
          className="relative w-48 h-48 rounded-full overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <motion.div
            className="absolute inset-0"
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
            transition={shimmerTransition}
            style={shimmerStyle}
          />
        </motion.div>
        
        {/* Text skeleton */}
        <motion.div
          className="mt-6 h-8 w-32 rounded-lg overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <motion.div
            className="absolute inset-0"
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
            transition={shimmerTransition}
            style={shimmerStyle}
          />
        </motion.div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-3 ${className}`} data-testid="loading-skeleton">
        {Array.from({ length: count }).map((_, index) => (
          <motion.div
            key={index}
            className="relative h-12 rounded-lg overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(16px)',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.div
              className="absolute inset-0"
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              transition={shimmerTransition}
              style={shimmerStyle}
            />
          </motion.div>
        ))}
      </div>
    );
  }

  // Default: card variant
  return (
    <div data-testid="loading-skeleton">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className={`relative overflow-hidden rounded-2xl p-6 ${className}`}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0"
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
            transition={shimmerTransition}
            style={shimmerStyle}
          />
          
          {/* Card content skeleton */}
          <div className="relative z-10 flex items-start gap-4">
            {/* Icon skeleton */}
            <div 
              className="flex-shrink-0 w-12 h-12 rounded-xl"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
            />
            
            {/* Text content skeleton */}
            <div className="flex-1 space-y-3">
              {/* Title */}
              <div 
                className="h-5 w-3/4 rounded"
                style={{ background: 'rgba(255, 255, 255, 0.1)' }}
              />
              
              {/* Content lines */}
              <div 
                className="h-4 w-full rounded"
                style={{ background: 'rgba(255, 255, 255, 0.08)' }}
              />
              <div 
                className="h-4 w-5/6 rounded"
                style={{ background: 'rgba(255, 255, 255, 0.08)' }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
