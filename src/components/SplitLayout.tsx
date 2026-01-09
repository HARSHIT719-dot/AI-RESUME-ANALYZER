import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FileText, BarChart3 } from 'lucide-react';

interface SplitLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

export const SplitLayout: React.FC<SplitLayoutProps> = ({ leftPanel, rightPanel }) => {
  const [expandedPanel, setExpandedPanel] = useState<'left' | 'right' | 'both'>('both');

  const togglePanel = (panel: 'left' | 'right') => {
    if (expandedPanel === panel) {
      setExpandedPanel('both');
    } else {
      setExpandedPanel(panel);
    }
  };

  return (
    <div className="h-full">
      {/* Desktop/Tablet Layout (lg and up) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="hidden lg:grid lg:grid-cols-2 gap-4 lg:gap-6 h-full"
      >
        {/* Left Panel - PDF Preview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="h-[calc(100vh-200px)] overflow-hidden"
        >
          {leftPanel}
        </motion.div>

        {/* Right Panel - Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="overflow-y-auto h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        >
          {rightPanel}
        </motion.div>
      </motion.div>

      {/* Mobile Layout (below lg) - Collapsible Panels */}
      <div className="lg:hidden space-y-4">
        {/* PDF Preview Panel */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          <button
            onClick={() => togglePanel('left')}
            className="w-full px-4 py-3 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Resume Preview</span>
            </div>
            <motion.div
              animate={{ rotate: expandedPanel === 'left' || expandedPanel === 'both' ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </button>
          
          <AnimatePresence>
            {(expandedPanel === 'left' || expandedPanel === 'both') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="h-[400px] sm:h-[500px]">
                  {leftPanel}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Analysis Results Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          <button
            onClick={() => togglePanel('right')}
            className="w-full px-4 py-3 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Analysis Results</span>
            </div>
            <motion.div
              animate={{ rotate: expandedPanel === 'right' || expandedPanel === 'both' ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </button>
          
          <AnimatePresence>
            {(expandedPanel === 'right' || expandedPanel === 'both') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4">
                  {rightPanel}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};
