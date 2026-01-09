import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { ThemeToggle } from './ui/ThemeToggle'; // Import ThemeToggle

export const Header: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <motion.header
      initial={prefersReducedMotion ? { opacity: 1 } : { y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full"
    >
      <div 
        className="backdrop-blur-md bg-card border-b border-border relative overflow-hidden shadow-sm"
        style={{
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        }}
      >
        {/* Animated gradient line at bottom */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#38BDF8]/40 to-[#A855F7]/40"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            backgroundSize: '200% 100%',
          }}
        />

        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-3"> {/* Changed justify-center to justify-between */}
            <motion.div
              animate={!prefersReducedMotion ? { 
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1, 1.1, 1]
              } : {}}
              transition={{ 
                duration: 2,
                repeat: prefersReducedMotion ? 0 : Infinity,
                repeatDelay: 3
              }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 15px hsl(var(--primary)/0.4)' }}
            >
              <Sparkles 
                className="w-6 h-6 sm:w-8 sm:h-8 text-[hsl(var(--primary))]" 
                style={{
                  filter: 'drop-shadow(0 0 8px hsl(var(--primary)/0.6))',
                }}
              />
            </motion.div>
            
            <button
              onClick={scrollToTop}
              aria-label="Scroll to top - AI-ATS-Analyzer"
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-transparent bg-clip-text
                         bg-gradient-to-r from-[#c0c0c0] via-[#ffffff] to-[#c0c0c0]
                         dark:from-[#8e9eab] dark:via-[#eef2f3] dark:to-[#8e9eab]
                         hover:scale-105 transition-all duration-300 touch-manipulation 
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] 
                         focus-visible:ring-offset-2 focus-visible:ring-offset-white 
                         dark:focus-visible:ring-offset-gray-900 rounded-lg px-2
                         animate-metallic-shine"
              style={{
                filter: 'drop-shadow(0 2px 12px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 20px rgba(192, 192, 192, 0.3))',
                backgroundSize: '200% auto',
                WebkitTextStroke: '0.5px rgba(255, 255, 255, 0.1)',
              }}
            >
              AI-ATS-Analyzer
            </button>
            
            <ThemeToggle /> {/* Add ThemeToggle component */}
          </div>
        </div>
      </div>
    </motion.header>
  );
};
