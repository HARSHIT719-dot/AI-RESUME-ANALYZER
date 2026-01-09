import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Clock } from 'lucide-react';

interface LoadingWithTimeoutProps {
  message?: string;
  timeout?: number; // in seconds
  onTimeout?: () => void;
}

export const LoadingWithTimeout = ({ 
  message = 'Processing...', 
  timeout = 30,
  onTimeout 
}: LoadingWithTimeoutProps) => {
  const [elapsed, setElapsed] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        
        // Show warning at 70% of timeout
        if (next >= timeout * 0.7 && !showWarning) {
          setShowWarning(true);
        }
        
        // Trigger timeout callback
        if (next >= timeout && onTimeout) {
          onTimeout();
          clearInterval(interval);
        }
        
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeout, onTimeout, showWarning]);

  const progress = Math.min((elapsed / timeout) * 100, 100);

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className="w-12 h-12 text-cyan-400" />
      </motion.div>

      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-white">{message}</p>
        
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-yellow-400 text-sm"
          >
            <Clock className="w-4 h-4" />
            <span>This is taking longer than usual...</span>
          </motion.div>
        )}
      </div>

      {/* Progress indicator */}
      <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <p className="text-sm text-gray-400">
        {elapsed}s / {timeout}s
      </p>
    </div>
  );
};
