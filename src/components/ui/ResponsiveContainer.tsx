import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useOrientation } from '../../hooks/useOrientation';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  maxWidth = 'xl',
}) => {
  const orientation = useOrientation();

  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  return (
    <motion.div
      key={orientation}
      initial={{ opacity: 0.95 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        ${maxWidthClasses[maxWidth]}
        mx-auto
        px-4 sm:px-6 lg:px-8
        w-full
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};
