import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { hoverScale, tapScale } from '../../utils/animations';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
}) => {
  const prefersReducedMotion = useReducedMotion();
  const baseStyles = `
    relative px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base
    transition-all duration-300
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background
    touch-manipulation min-h-[44px]
  `;

  const variantStyles = {
    primary: `
      bg-primary text-primary-foreground border border-border
      hover:bg-primary/90 hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)]
      focus-visible:ring-primary
    `,
    secondary: `
      bg-secondary text-secondary-foreground border border-border
      hover:bg-secondary/90 hover:shadow-[0_0_20px_hsl(var(--secondary)/0.5)]
      focus-visible:ring-secondary
    `,
    outline: `
      bg-transparent text-foreground border-2 border-border
      hover:bg-accent/10 hover:border-border
      hover:shadow-[0_0_20px_hsl(var(--foreground)/0.2)]
      focus-visible:ring-foreground
    `,
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading && !prefersReducedMotion ? hoverScale(1.05) : undefined}
      whileTap={!disabled && !loading && !prefersReducedMotion ? tapScale(0.98) : undefined}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
        )}
        {children}
      </span>
    </motion.button>
  );
};
