import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Copy, FileText, Check } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface ExportButtonProps {
  onExportPDF?: () => void;
  onExportText?: () => void;
  onCopyToClipboard?: () => void;
  label?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onExportPDF,
  onExportText,
  onCopyToClipboard,
  label = 'Export',
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleCopy = async () => {
    if (onCopyToClipboard) {
      await onCopyToClipboard();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowMenu(false);
    }
  };

  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF();
      setShowMenu(false);
    }
  };

  const handleExportText = () => {
    if (onExportText) {
      onExportText();
      setShowMenu(false);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  };

  return (
    <div className="relative inline-block">
      <motion.button
        onClick={() => setShowMenu(!showMenu)}
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          rounded-lg font-medium shadow-md
          transition-all duration-300
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
          flex items-center gap-2
          ${className}
        `}
        whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
        whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>{label}</span>
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl bg-card border border-border z-50 overflow-hidden"
              style={{
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="py-1">
                {onCopyToClipboard && (
                  <button
                    onClick={handleCopy}
                    className="w-full px-4 py-2.5 text-left hover:bg-muted transition-colors duration-200 flex items-center gap-3 text-foreground"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy to Clipboard</span>
                  </button>
                )}

                {onExportText && (
                  <button
                    onClick={handleExportText}
                    className="w-full px-4 py-2.5 text-left hover:bg-muted transition-colors duration-200 flex items-center gap-3 text-foreground"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Download as Text</span>
                  </button>
                )}

                {onExportPDF && (
                  <button
                    onClick={handleExportPDF}
                    className="w-full px-4 py-2.5 text-left hover:bg-muted transition-colors duration-200 flex items-center gap-3 text-foreground"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export as PDF</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
