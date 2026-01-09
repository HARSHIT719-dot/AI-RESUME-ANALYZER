/**
 * Theme Utilities
 * Helper functions for theme management and styling
 */

export type Theme = 'light' | 'dark';

/**
 * Get the current theme from localStorage or system preference
 */
export const getInitialTheme = (): Theme => {
  // Check localStorage first
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  // Fall back to system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
};

/**
 * Apply theme to document
 */
export const applyTheme = (theme: Theme): void => {
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  localStorage.setItem('theme', theme);
};

/**
 * Get metallic gradient classes based on theme
 */
export const getMetallicGradient = (theme: Theme): string => {
  return theme === 'light'
    ? 'bg-gradient-to-r from-[#c0c0c0] via-[#ffffff] to-[#c0c0c0]'
    : 'bg-gradient-to-r from-[#8e9eab] via-[#eef2f3] to-[#8e9eab]';
};

/**
 * Get glassmorphism classes based on theme
 */
export const getGlassmorphismClasses = (theme: Theme, variant: 'card' | 'panel' = 'card'): string => {
  const baseClasses = 'backdrop-blur-md border';
  
  if (variant === 'card') {
    return theme === 'light'
      ? `${baseClasses} bg-white/8 border-white/15`
      : `${baseClasses} bg-slate-900/70 border-white/12`;
  }
  
  return theme === 'light'
    ? `${baseClasses} bg-white/10 border-white/20`
    : `${baseClasses} bg-slate-900/80 border-white/15`;
};

/**
 * Listen for system theme changes
 */
export const watchSystemTheme = (callback: (theme: Theme) => void): (() => void) => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };
  
  mediaQuery.addEventListener('change', handler);
  
  // Return cleanup function
  return () => mediaQuery.removeEventListener('change', handler);
};
