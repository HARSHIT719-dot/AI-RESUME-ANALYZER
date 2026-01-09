import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export const OfflineIndicator = () => {
  const { isOnline, wasOffline } = useNetworkStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 backdrop-blur-sm">
            <WifiOff className="w-5 h-5" />
            <span className="font-medium">You're offline. Check your connection.</span>
          </div>
        </motion.div>
      )}
      
      {isOnline && wasOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 backdrop-blur-sm">
            <Wifi className="w-5 h-5" />
            <span className="font-medium">Back online!</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
