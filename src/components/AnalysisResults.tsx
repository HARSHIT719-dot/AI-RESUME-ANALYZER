import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Filter,
  Palette,
  Key,
  Award,
  MinusCircle
} from 'lucide-react';
import { AnalysisResult } from '../types';
import { LoadingSkeleton } from './ui/LoadingSkeleton';
import { Button } from './ui/Button';
import { AnimatedSection } from './ui/AnimatedSection';
import { FunLoadingMessages } from './ui/FunLoadingMessages';
import { ScoreGauge } from './ScoreGauge';
import { ScoreBreakdown } from './ScoreBreakdown';
import { ExportButton } from './ui/ExportButton';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { hoverScale, tapScale, glowPulse } from '../utils/animations';
import { celebrateWithConfetti } from '../utils/confetti';
import {
  exportAnalysisToClipboard,
  exportAnalysisAsTextFile,
  exportAsPDF,
} from '../services/exportService';

interface AnalysisResultsProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  onGenerateQuestions: () => void;
  isGeneratingQuestions?: boolean;
  error: string | null;
  isRetryable?: boolean;
  onRetry?: () => void;
}

type CategoryFilter = 'all' | 'strengths' | 'suggestions' | 'unnecessary' | 'formatting';

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  result,
  isLoading,
  onGenerateQuestions,
  isGeneratingQuestions = false,
  error,
  isRetryable = false,
  onRetry,
}) => {
  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY RETURNS!
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');
  const prefersReducedMotion = useReducedMotion();

  // Trigger confetti on first render with results if score is high or perfect
  useEffect(() => {
    if (result && !isLoading && !error) {
      if (result.isPerfect || result.overallScore >= 90) {
        setTimeout(() => celebrateWithConfetti(), 300);
      }
    }
  }, [result, isLoading, error]);

  // NOW we can do early returns AFTER all hooks
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Fun loading messages */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <FunLoadingMessages type="analysis" />
        </motion.div>

        {/* Score skeleton */}
        <LoadingSkeleton variant="score" />

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton variant="card" count={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-8 px-4 bg-card border border-border rounded-xl shadow-lg">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="rounded-full p-4 mx-auto mb-4 bg-red-100 dark:bg-red-950/30 w-fit"
        >
          <AlertCircle className="w-12 h-12 text-destructive" />
        </motion.div>
        <h2 className="text-3xl font-bold text-destructive dark:text-foreground mb-4">Analysis Failed</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">{error}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isRetryable && onRetry && (
            <Button
              onClick={onRetry}
              className="bg-[#111827] text-white dark:bg-background dark:border dark:border-[#38BDF8] dark:text-[#E5E7EB]"
            >
              Retry
            </Button>
          )}
          <Button
            onClick={() => window.location.reload()}
            className="bg-transparent border border-muted text-muted-foreground hover:bg-muted/50"
          >
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  // Check if resume is perfect
  if (result.isPerfect) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 px-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{
            scale: 1,
            rotate: 0,
            ...glowPulse('hsl(var(--primary)/0.6)'),
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="mb-6"
        >
          <CheckCircle2 className="w-24 h-24 text-primary mx-auto" />
        </motion.div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--primary-foreground))] to-[hsl(var(--accent))] bg-clip-text text-transparent mb-4">
          Your Resume is Perfect! 🎉
        </h2>
        <div className="mt-8 mb-8">
          <ScoreGauge score={100} label="Perfect Score" />
        </div>
        <p className="text-muted-foreground text-lg mb-8">{result.summary}</p>

        <div className="space-y-4">
          {isGeneratingQuestions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FunLoadingMessages type="questions" />
            </motion.div>
          )}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="primary"
              onClick={onGenerateQuestions}
              loading={isGeneratingQuestions}
              disabled={isGeneratingQuestions}
            >
              <MessageSquare className="w-5 h-5" />
              <span>{isGeneratingQuestions ? 'Generating...' : 'Generate Interview Questions'}</span>
            </Button>
          </motion.div>
          
          <ExportButton
            label="Export Analysis"
            variant="secondary"
            onCopyToClipboard={() => exportAnalysisToClipboard(result)}
            onExportText={() => exportAnalysisAsTextFile(result)}
            onExportPDF={() => exportAsPDF({ analysisResult: result })}
          />
        </div>
      </div>
    );
  }

  const filters: { id: CategoryFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: result.suggestions.length + result.unnecessaryItems.length + result.strengths.length + result.formattingFeedback.length },
    { id: 'strengths', label: 'Strengths', count: result.strengths.length },
    { id: 'suggestions', label: 'Suggestions', count: result.suggestions.length },
    { id: 'unnecessary', label: 'Redundant', count: result.unnecessaryItems.length },
    { id: 'formatting', label: 'Formatting', count: result.formattingFeedback.length },
  ];

  const shouldShowItem = (category: CategoryFilter) => {
    if (activeFilter === 'all') return true;
    return activeFilter === category;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">

      {/* Top Section: Score & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Score Gauge */}
        <AnimatedSection className="md:col-span-1 flex justify-center">
          <ScoreGauge score={result.overallScore} label="ATS Score" />
        </AnimatedSection>

        {/* Summary Card */}
        <AnimatedSection delay={0.1} className="md:col-span-2 h-full">
          <div className="bg-card backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-border h-full flex flex-col justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground mb-4">
              Analysis Summary
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {result.summary}
            </p>
          </div>
        </AnimatedSection>
      </div>

      {/* Score Breakdown */}
      <AnimatedSection delay={0.15}>
        <ScoreBreakdown
          scores={{
            formatting: 85,
            content: 90,
            keywords: result.keywordAnalysis?.score || 0,
            atsCompatibility: result.overallScore,
          }}
        />
      </AnimatedSection>

      {/* Action Button */}
      <AnimatedSection delay={0.2}>
        <div className="flex flex-col items-center justify-center mb-6 sm:mb-8 px-2 sm:px-0 space-y-4">
          {isGeneratingQuestions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <FunLoadingMessages type="questions" />
            </motion.div>
          )}
          <Button
            variant="primary"
            onClick={onGenerateQuestions}
            loading={isGeneratingQuestions}
            disabled={isGeneratingQuestions}
            className="w-full sm:w-auto px-8 py-4 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            {isGeneratingQuestions ? 'Generating Questions...' : 'Generate Interview Questions'}
          </Button>
        </div>
      </AnimatedSection>

      {/* Keyword Analysis Section */}
      <AnimatedSection delay={0.25}>
        <div className="bg-card backdrop-blur-md rounded-2xl p-6 border border-border shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-pink-500/10">
              <Key className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Keyword Optimization</h3>
              <p className="text-sm text-muted-foreground">Match rate with industry standards: <span className="font-bold text-foreground">{result.keywordAnalysis.score}%</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-green-500 mb-3 uppercase tracking-wider">Present Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {result.keywordAnalysis.presentKeywords.length > 0 ? (
                  result.keywordAnalysis.presentKeywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium border border-green-500/20">
                      {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm italic">No major keywords detected.</span>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-red-500 mb-3 uppercase tracking-wider">Missing Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {result.keywordAnalysis.missingKeywords.length > 0 ? (
                  result.keywordAnalysis.missingKeywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium border border-red-500/20">
                      {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm italic">Great job! No critical keywords missing.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Category Filters */}
      <AnimatedSection delay={0.3}>
        <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8 flex-wrap px-2 sm:px-0">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              aria-label={`Filter by ${filter.label} - ${filter.count} items`}
              aria-pressed={activeFilter === filter.id}
              className={`
                px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300
                touch-manipulation min-h-[44px] sm:min-h-0 border
                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
                ${activeFilter === filter.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_15px_hsl(var(--primary)/0.4)]'
                  : 'bg-card text-foreground border-border hover:bg-muted/50'
                }
              `}
              whileHover={hoverScale(1.05)}
              whileTap={tapScale(0.95)}
            >
              {filter.label}
              <span className="ml-1 sm:ml-2 text-xs opacity-70" aria-hidden="true">({filter.count})</span>
            </motion.button>
          ))}
        </div>
      </AnimatedSection>

      {/* Detailed Analysis Grid */}
      <motion.div
        className="grid grid-cols-1 gap-6"
        layout
      >
        {/* Strengths Section */}
        {shouldShowItem('strengths') && result.strengths.length > 0 && (
          <AnimatedSection delay={0.4}>
            <div className="bg-card backdrop-blur-md rounded-xl p-6 border-l-4 border-l-green-500 border-y border-r border-border shadow-sm hover-lift hover-glow transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-green-500" />
                <h3 className="text-xl font-bold text-foreground">Strengths</h3>
              </div>
              <ul className="space-y-3">
                {result.strengths.map((item, index) => (
                  <motion.li
                    key={`strength-${index}`}
                    initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 text-muted-foreground"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        )}

        {/* Formatting Section */}
        {shouldShowItem('formatting') && result.formattingFeedback.length > 0 && (
          <AnimatedSection delay={0.45}>
            <div className="bg-card backdrop-blur-md rounded-xl p-6 border-l-4 border-l-blue-500 border-y border-r border-border shadow-sm hover-lift hover-glow transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <Palette className="w-6 h-6 text-blue-500" />
                <h3 className="text-xl font-bold text-foreground">Formatting Feedback</h3>
              </div>
              <ul className="space-y-3">
                {result.formattingFeedback.map((item, index) => (
                  <motion.li
                    key={`fmt-${index}`}
                    initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 text-muted-foreground"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        )}

        {/* Suggestions Section */}
        {shouldShowItem('suggestions') && result.suggestions.length > 0 && (
          <AnimatedSection delay={0.5}>
            <div className="bg-card backdrop-blur-md rounded-xl p-6 border-l-4 border-l-amber-500 border-y border-r border-border shadow-sm hover-lift hover-glow transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-amber-500" />
                <h3 className="text-xl font-bold text-foreground">Suggestions for Improvement</h3>
              </div>
              <ul className="space-y-3">
                {result.suggestions.map((suggestion, index) => (
                  <motion.li
                    key={`suggestion-${index}`}
                    initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2.5 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        )}

        {/* Unnecessary Items Section */}
        {shouldShowItem('unnecessary') && result.unnecessaryItems.length > 0 && (
          <AnimatedSection delay={0.55}>
            <div className="bg-card backdrop-blur-md rounded-xl p-6 border-l-4 border-l-red-500 border-y border-r border-border shadow-sm hover-lift hover-glow transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <MinusCircle className="w-6 h-6 text-red-500" />
                <h3 className="text-xl font-bold text-foreground">Redundant Content</h3>
              </div>
              <ul className="space-y-3">
                {result.unnecessaryItems.map((item, index) => (
                  <motion.li
                    key={`unnecessary-${index}`}
                    initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2.5 flex-shrink-0" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        )}

      </motion.div>
    </div>
  );
};
