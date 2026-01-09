import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { InterviewQuestion } from '../types';
import { GlassCard } from './ui/GlassCard';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { fadeInUp, rotate, hoverScale, tapScale, durations, easings } from '../utils/animations';

interface QuestionCardProps {
  question: InterviewQuestion;
  index: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(question.question);
      setIsCopied(true);
      toast.success('Question copied to clipboard!', {
        icon: '📋',
        duration: 2000,
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy question', {
        duration: 2000,
      });
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'behavioral':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'experience':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'problem-solving':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : fadeInUp.hidden}
      animate={prefersReducedMotion ? { opacity: 1, y: 0 } : {
        ...fadeInUp.visible,
        transition: {
          ...(fadeInUp.visible as any).transition,
          delay: index * 0.05,
        }
      }}
    >
      <GlassCard hover={false} className="overflow-hidden">
        {/* Header - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} interview question: ${question.question}`}
          className="w-full p-3 sm:p-4 text-left flex items-start gap-3 sm:gap-4 hover:bg-white/5 transition-colors duration-200 touch-manipulation min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-neon focus-visible:ring-inset rounded-lg"
        >
          {/* Expand icon */}
          <motion.div
            animate={rotate(isExpanded ? 180 : 0, prefersReducedMotion ? durations.instant : durations.normal)}
            className="flex-shrink-0 mt-1"
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
              <span
                className={`
                  px-2 py-0.5 sm:py-1 rounded-md text-xs font-medium border
                  ${getCategoryColor(question.category)}
                `}
              >
                {question.category}
              </span>
              <span
                className={`
                  px-2 py-0.5 sm:py-1 rounded-md text-xs font-medium border
                  ${getDifficultyColor(question.difficulty)}
                `}
              >
                {question.difficulty}
              </span>
            </div>

            {/* Question preview */}
            <p className="text-white font-medium line-clamp-2 text-sm sm:text-base">
              {question.question}
            </p>
          </div>
        </button>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ 
                duration: prefersReducedMotion ? durations.instant : durations.normal, 
                ease: easings.smooth 
              }}
              className="overflow-hidden"
            >
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t border-white/10">
                {/* Full question text */}
                <p className="text-gray-300 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
                  {question.question}
                </p>

                {/* Copy button */}
                <motion.button
                  onClick={handleCopyToClipboard}
                  whileHover={!prefersReducedMotion ? hoverScale(1.05) : undefined}
                  whileTap={!prefersReducedMotion ? tapScale(0.95) : undefined}
                  aria-label={isCopied ? 'Question copied to clipboard' : 'Copy question to clipboard'}
                  className={`
                    flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg
                    text-xs sm:text-sm font-medium transition-all duration-200
                    touch-manipulation min-h-[44px]
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-neon focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900
                    ${isCopied
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:border-white/20'
                    }
                  `}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Question
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
};
