import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-full bg-gradient-to-br from-muted to-muted/70 
                 text-muted-foreground shadow-lg border border-border/50
                 hover:shadow-xl hover:border-primary/30 transition-all duration-300
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary 
                 focus-visible:ring-offset-2 focus-visible:ring-offset-background
                 backdrop-blur-sm overflow-hidden"
      whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
      whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Animated glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0"
        animate={{
          opacity: [0, 0.3, 0],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <AnimatePresence mode="wait">
        {theme === 'light' ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: 'easeInOut' }}
          >
            <Moon className="w-5 h-5 relative z-10" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: 'easeInOut' }}
          >
            <Sun className="w-5 h-5 relative z-10" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
