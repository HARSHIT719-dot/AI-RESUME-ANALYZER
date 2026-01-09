import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { fadeInUp, hoverLift, durations, easings } from '../../utils/animations';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '',
  hover = true 
}) => {
  return (
    <motion.div
      initial={fadeInUp.hidden}
      animate={fadeInUp.visible}
      whileHover={hover ? { 
        ...hoverLift,
        boxShadow: '0 20px 60px rgba(139, 92, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.05)',
        transition: {
          duration: durations.fast,
          ease: easings.snappy,
        }
      } : undefined}
      className={`
        relative overflow-hidden rounded-2xl
        glass-enhanced
        transition-all duration-300
        ${className}
      `}
    >
      {/* Animated gradient border glow effect */}
      {hover && (
        <div 
          className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(59, 130, 246, 0.4), rgba(6, 182, 212, 0.4), rgba(139, 92, 246, 0.4))',
            backgroundSize: '200% 200%',
            filter: 'blur(20px)',
            transform: 'translateZ(0)',
            animation: 'gradient-rotate 3s ease infinite',
          }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
