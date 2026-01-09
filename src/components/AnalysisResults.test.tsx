import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnalysisResults } from './AnalysisResults';
import { AnalysisResult } from '../types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
    circle: ({ ...props }: any) => <circle {...props} />
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock hooks
vi.mock('../hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

// Mock confetti
vi.mock('../utils/confetti', () => ({
  celebrateWithConfetti: vi.fn(),
}));

// Mock inner components
vi.mock('./ui/LoadingSkeleton', () => ({
  LoadingSkeleton: () => <div data-testid="loading-skeleton">Loading...</div>,
}));

vi.mock('./ui/Button', () => ({
  Button: ({ children, onClick, disabled, loading, ...props }: any) => (
    <button onClick={onClick} disabled={disabled || loading} {...props}>
      {loading && <span>Loading...</span>}
      {children}
    </button>
  ),
}));

vi.mock('./ui/AnimatedSection', () => ({
  AnimatedSection: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('./ScoreGauge', () => ({
  ScoreGauge: ({ score, label }: any) => <div data-testid="score-gauge">{label}: {score}</div>,
}));

describe('AnalysisResults', () => {
  const mockOnGenerateQuestions = vi.fn();
  const mockOnRetry = vi.fn();

  const mockAnalysisResult: AnalysisResult = {
    isPerfect: false,
    overallScore: 85,
    summary: 'Good resume with room for improvement',
    suggestions: [
      'Add more quantifiable achievements',
      'Include specific metrics and numbers',
    ],
    unnecessaryItems: [
      'Remove objective statement',
      'Reduce personal pronouns',
    ],
    strengths: [
      'Strong action verbs used throughout the resume.',
      'Clear and easy-to-read formatting.',
    ],
    formattingFeedback: [
      'Use consistent font sizes.',
      'Check margin alignment.'
    ],
    keywordAnalysis: {
      score: 90,
      missingKeywords: ['Docker'],
      presentKeywords: ['React', 'TypeScript']
    },
    // Legacy fields handling if needed by component (it doesn't rely on them anymore)
    categories: {
      'Clarity': 90
    }
  };

  beforeEach(() => {
    mockOnGenerateQuestions.mockClear();
    mockOnRetry.mockClear();
  });

  describe('Loading state', () => {
    it('should display loading skeleton when isLoading is true', () => {
      render(
        <AnalysisResults
          result={null}
          isLoading={true}
          onGenerateQuestions={mockOnGenerateQuestions}
          error={null}
        />
      );

      const skeletons = screen.getAllByTestId('loading-skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Error state', () => {
    it('should display error message when error is present', () => {
      const errorMessage = 'Analysis failed. Please try again.';

      render(
        <AnalysisResults
          result={null}
          isLoading={false}
          onGenerateQuestions={mockOnGenerateQuestions}
          error={errorMessage}
        />
      );

      expect(screen.getByText('Analysis Failed')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should show retry button when error is retryable', async () => {
      const user = userEvent.setup();

      render(
        <AnalysisResults
          result={null}
          isLoading={false}
          onGenerateQuestions={mockOnGenerateQuestions}
          error="Network error"
          isRetryable={true}
          onRetry={mockOnRetry}
        />
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();

      await user.click(retryButton);
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('Perfect resume state', () => {
    it('should display perfect resume message when isPerfect is true', () => {
      const perfectResult: AnalysisResult = {
        isPerfect: true,
        overallScore: 100,
        summary: 'Your resume is excellent!',
        suggestions: [],
        unnecessaryItems: [],
        strengths: ['Everything is perfect'],
        formattingFeedback: [],
        keywordAnalysis: { score: 100, missingKeywords: [], presentKeywords: ['All'] }
      };

      render(
        <AnalysisResults
          result={perfectResult}
          isLoading={false}
          onGenerateQuestions={mockOnGenerateQuestions}
          error={null}
        />
      );

      expect(screen.getByText(/Your Resume is Perfect/i)).toBeInTheDocument();
      expect(screen.getByText(perfectResult.summary)).toBeInTheDocument();
      expect(screen.getByTestId('score-gauge')).toHaveTextContent('Perfect Score: 100');
    });
  });

  describe('Analysis results display', () => {
    it('should display analysis summary and score', () => {
      render(
        <AnalysisResults
          result={mockAnalysisResult}
          isLoading={false}
          onGenerateQuestions={mockOnGenerateQuestions}
          error={null}
        />
      );

      expect(screen.getByText('Analysis Summary')).toBeInTheDocument();
      expect(screen.getByText(mockAnalysisResult.summary)).toBeInTheDocument();
      expect(screen.getByTestId('score-gauge')).toHaveTextContent('ATS Score: 85');
    });

    it('should display all sections initially (All filter)', () => {
      render(
        <AnalysisResults
          result={mockAnalysisResult}
          isLoading={false}
          onGenerateQuestions={mockOnGenerateQuestions}
          error={null}
        />
      );

      expect(screen.getByRole('heading', { name: 'Suggestions for Improvement' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Redundant Content' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Strengths' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Formatting Feedback' })).toBeInTheDocument();
    });

    it('should display keywords analysis', () => {
      render(
        <AnalysisResults
          result={mockAnalysisResult}
          isLoading={false}
          onGenerateQuestions={mockOnGenerateQuestions}
          error={null}
        />
      );

      expect(screen.getByText('Keyword Optimization')).toBeInTheDocument();
      expect(screen.getByText('Present Keywords')).toBeInTheDocument();
      expect(screen.getByText('Missing Keywords')).toBeInTheDocument();
      expect(screen.getByText('Docker')).toBeInTheDocument(); // Missing
      expect(screen.getByText('React')).toBeInTheDocument(); // Present
    });
  });

  describe('Category filtering', () => {
    it('should filter to show only strengths', async () => {
      const user = userEvent.setup();
      render(
        <AnalysisResults
          result={mockAnalysisResult}
          isLoading={false}
          onGenerateQuestions={mockOnGenerateQuestions}
          error={null}
        />
      );

      const filterBtn = screen.getByRole('button', { name: /Strengths/i });
      await user.click(filterBtn);

      expect(screen.getByRole('heading', { name: 'Strengths' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Suggestions for Improvement' })).not.toBeInTheDocument();
    });

    it('should filter to show only redundant items', async () => {
      const user = userEvent.setup();
      render(
        <AnalysisResults
          result={mockAnalysisResult}
          isLoading={false}
          onGenerateQuestions={mockOnGenerateQuestions}
          error={null}
        />
      );

      // Label is "Redundant" now
      const filterBtn = screen.getByRole('button', { name: /Redundant/i });
      await user.click(filterBtn);

      expect(screen.getByRole('heading', { name: 'Redundant Content' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Strengths' })).not.toBeInTheDocument();
    });

    it('should filter to show only formatting', async () => {
      const user = userEvent.setup();
      render(
        <AnalysisResults
          result={mockAnalysisResult}
          isLoading={false}
          onGenerateQuestions={mockOnGenerateQuestions}
          error={null}
        />
      );

      const filterBtn = screen.getByRole('button', { name: /Formatting/i });
      await user.click(filterBtn);

      expect(screen.getByRole('heading', { name: 'Formatting Feedback' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Strengths' })).not.toBeInTheDocument();
    });
  });
});
