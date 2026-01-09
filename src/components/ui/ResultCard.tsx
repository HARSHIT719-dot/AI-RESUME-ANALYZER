import { motion } from 'framer-motion';
import { LucideIcon, Copy, Check } from 'lucide-react';
import { ReactNode, useState } from 'react';
import toast from 'react-hot-toast';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { fadeInUp, durations, easings } from '../../utils/animations';

interface ResultCardProps {
  title: string;
  content: ReactNode;
  icon: LucideIcon;
  variant?: 'success' | 'warning' | 'info';
  className?: string;
  showCopyButton?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  title,
  content,
  icon: Icon,
  variant = 'info',
  className = '',
  showCopyButton = true,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    const textContent = typeof content === 'string' ? content : '';
    if (!textContent) return;

    try {
      await navigator.clipboard.writeText(textContent);
      setIsCopied(true);
      toast.success('Copied to clipboard!', {
        icon: <Check className="w-4 h-4" />,
        duration: 2000,
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy', { duration: 2000 });
    }
  };
  const variantStyles = {
    success: {
      border: 'border-green-500/30',
      glow: 'rgba(34, 197, 94, 0.4)',
      edgeGlow: 'edge-glow-green',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-400',
    },
    warning: {
      border: 'border-yellow-500/30',
      glow: 'rgba(234, 179, 8, 0.4)',
      edgeGlow: 'edge-glow-orange',
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-400',
    },
    info: {
      border: 'border-blue-500/30',
      glow: 'rgba(59, 130, 246, 0.4)',
      edgeGlow: 'edge-glow-blue',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
    },
  };

  const style = variantStyles[variant];

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : fadeInUp.hidden}
      animate={prefersReducedMotion ? { opacity: 1, y: 0 } : fadeInUp.visible}
      whileHover={!prefersReducedMotion ? {
        y: -8,
        boxShadow: `0 20px 60px ${style.glow}, 0 0 40px ${style.glow}, inset 0 0 20px rgba(255, 255, 255, 0.05)`,
        transition: {
          duration: durations.fast,
          ease: easings.snappy,
        }
      } : undefined}
      className={`
        relative overflow-hidden rounded-2xl
        glass-enhanced
        border ${style.border}
        transition-all duration-300
        hover:border-opacity-50
        ${className}
      `}
    >
      {/* Enhanced edge glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top left, ${style.glow}, transparent 60%), radial-gradient(circle at bottom right, ${style.glow}, transparent 60%)`,
          filter: 'blur(25px)',
          transform: 'translateZ(0)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Icon */}
          <motion.div
            className={`flex-shrink-0 p-2 sm:p-3 rounded-xl ${style.iconBg} ${style.iconColor}`}
            whileHover={!prefersReducedMotion ? {
              scale: 1.1,
              rotate: 5,
              transition: {
                duration: durations.fast,
                ease: easings.spring,
              }
            } : undefined}
          >
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
              <h3 className="text-base sm:text-lg font-semibold text-white">
                {title}
              </h3>
              {showCopyButton && typeof content === 'string' && (
                <motion.button
                  onClick={handleCopy}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex-shrink-0 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  aria-label="Copy to clipboard"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </motion.button>
              )}
            </div>
            <div className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              {content}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
