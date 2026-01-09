import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  className = '' 
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const dotSizeMap = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-6 h-6',
  };

  return (
    <div className={`relative ${sizeMap[size]} ${className}`}>
      {/* Outer rotating ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #8b5cf6, #3b82f6, #06b6d4, #8b5cf6)',
          backgroundSize: '200% 200%',
        }}
        animate={{
          rotate: 360,
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          rotate: {
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          },
          backgroundPosition: {
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          },
        }}
      >
        <div className="absolute inset-[2px] rounded-full bg-dark-900" />
      </motion.div>

      {/* Center pulsing dots */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`absolute ${dotSizeMap[size]} rounded-full`}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              boxShadow: '0 0 10px rgba(139, 92, 246, 0.8)',
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7],
              x: [
                0,
                Math.cos((i * 2 * Math.PI) / 3) * (size === 'sm' ? 8 : size === 'md' ? 12 : size === 'lg' ? 16 : 24),
                0,
              ],
              y: [
                0,
                Math.sin((i * 2 * Math.PI) / 3) * (size === 'sm' ? 8 : size === 'md' ? 12 : size === 'lg' ? 16 : 24),
                0,
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Inner rotating glow */}
      <motion.div
        className="absolute inset-[4px] rounded-full opacity-50"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4), transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};
