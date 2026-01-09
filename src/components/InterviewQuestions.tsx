import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, X, AlertCircle } from 'lucide-react';
import { InterviewQuestion } from '../types';
import { QuestionCard } from './QuestionCard';
import { QuestionStats } from './QuestionStats';
import { Button } from './ui/Button';
import { AnimatedSection } from './ui/AnimatedSection';
import { ExportButton } from './ui/ExportButton';
import {
  exportQuestionsToClipboard,
  exportQuestionsAsTextFile,
  exportAsPDF,
} from '../services/exportService';

interface InterviewQuestionsProps {
  questions: InterviewQuestion[];
  onBack: () => void;
  error?: string | null;
  isRetryable?: boolean;
  onRetry?: () => void;
}

type CategoryType = 'all' | 'technical' | 'behavioral' | 'experience' | 'problem-solving';
type SortType = 'default' | 'difficulty-asc' | 'difficulty-desc' | 'category';

export const InterviewQuestions: React.FC<InterviewQuestionsProps> = ({
  questions,
  onBack,
  error = null,
  isRetryable = false,
  onRetry,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('default');

  // Get unique categories and their counts
  const categories = useMemo(() => {
    const categoryMap = new Map<CategoryType, number>();
    categoryMap.set('all', questions.length);

    questions.forEach((q) => {
      const category = q.category as CategoryType;
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    return Array.from(categoryMap.entries()).map(([category, count]) => ({
      id: category,
      label: category === 'all' ? 'All Questions' : category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      count,
    }));
  }, [questions]);

  // Filter and sort questions based on active category, search query, and sort option
  const filteredQuestions = useMemo(() => {
    let filtered = questions;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter((q) => q.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((q) =>
        q.question.toLowerCase().includes(query) ||
        q.category.toLowerCase().includes(query) ||
        q.difficulty.toLowerCase().includes(query)
      );
    }

    // Sort questions
    const sorted = [...filtered];
    switch (sortBy) {
      case 'difficulty-asc':
        sorted.sort((a, b) => {
          const order = { easy: 1, medium: 2, hard: 3 };
          return order[a.difficulty] - order[b.difficulty];
        });
        break;
      case 'difficulty-desc':
        sorted.sort((a, b) => {
          const order = { easy: 1, medium: 2, hard: 3 };
          return order[b.difficulty] - order[a.difficulty];
        });
        break;
      case 'category':
        sorted.sort((a, b) => a.category.localeCompare(b.category));
        break;
      default:
        // Keep original order
        break;
    }

    return sorted;
  }, [questions, activeCategory, searchQuery, sortBy]);

  // Group questions by category
  const groupedQuestions = useMemo(() => {
    const groups = new Map<string, InterviewQuestion[]>();
    
    filteredQuestions.forEach((q) => {
      const category = q.category;
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(q);
    });

    return Array.from(groups.entries()).map(([category, questions]) => ({
      category,
      questions,
    }));
  }, [filteredQuestions]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Show error state if there's an error
  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-4">Failed to Load Questions</h2>
        <p className="text-red-300 mb-8 leading-relaxed">{error}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isRetryable && onRetry && (
            <Button onClick={onRetry} variant="primary">
              Retry
            </Button>
          )}
          <div className="flex gap-3">
            <ExportButton
              label="Export Questions"
              variant="secondary"
              onCopyToClipboard={() => exportQuestionsToClipboard(questions)}
              onExportText={() => exportQuestionsAsTextFile(questions)}
              onExportPDF={() => exportAsPDF({ interviewQuestions: questions })}
            />
            <Button onClick={onBack} variant="secondary">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Back to Analysis</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 px-2 sm:px-0">
      {/* Header */}
      <AnimatedSection>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-2 bg-gradient-to-r from-primary-400 via-accent-blue to-accent-neon bg-clip-text text-transparent">
              Interview Questions
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Prepare for your interview with these tailored questions
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-shrink-0 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back to Analysis</span>
          </Button>
        </div>
      </AnimatedSection>

      {/* Statistics */}
      <QuestionStats questions={questions} />

      {/* Search Bar */}
      <AnimatedSection delay={0.1}>
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            aria-label="Search interview questions"
            className="
              w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 rounded-xl
              bg-white/5 backdrop-blur-md
              border border-white/10
              text-white placeholder-gray-400 text-sm sm:text-base
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent
              transition-all duration-200
            "
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors touch-manipulation p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </AnimatedSection>

      {/* Category Tabs */}
      <AnimatedSection delay={0.2}>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Filter by ${category.label} - ${category.count} questions`}
              aria-pressed={activeCategory === category.id}
              className={`
                px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium
                transition-all duration-300 touch-manipulation min-h-[44px] sm:min-h-0
                focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-neon focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900
                ${activeCategory === category.id
                  ? 'bg-gradient-to-r from-primary-600 to-accent-blue text-white shadow-[0_0_20px_rgba(139,92,246,0.5)] border border-primary-400/30'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 hover:border-white/20'
                }
              `}
            >
              <span className="whitespace-nowrap">{category.label}</span>
              <span className="ml-1 sm:ml-2 text-xs opacity-70" aria-hidden="true">({category.count})</span>
            </motion.button>
          ))}
        </div>
      </AnimatedSection>

      {/* Questions Count */}
      <AnimatedSection delay={0.3}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm text-gray-400">
          <span aria-live="polite" aria-atomic="true">
            Showing {filteredQuestions.length} of {questions.length} questions
          </span>
          {searchQuery && (
            <span className="truncate max-w-full">
              Search results for "{searchQuery}"
            </span>
          )}
        </div>
      </AnimatedSection>

      {/* Questions List */}
      <AnimatedSection delay={0.4}>
        <AnimatePresence mode="wait">
          {filteredQuestions.length > 0 ? (
            <motion.div
              key={`${activeCategory}-${searchQuery}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {groupedQuestions.map((group, groupIndex) => (
                <div key={group.category} className="space-y-4">
                  {/* Category Header */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: groupIndex * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <h3 className="text-lg font-semibold text-white capitalize">
                      {group.category.split('-').join(' ')} Questions
                    </h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </motion.div>

                  {/* Questions in this category */}
                  <div className="space-y-4">
                    {group.questions.map((question, index) => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No questions found
              </h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your search or category filter
              </p>
              {searchQuery && (
                <Button
                  variant="secondary"
                  onClick={handleClearSearch}
                >
                  Clear Search
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatedSection>
    </div>
  );
};
