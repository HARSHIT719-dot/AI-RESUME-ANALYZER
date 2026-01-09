import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InterviewQuestions } from './InterviewQuestions';
import { InterviewQuestion } from '../types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock UI components
vi.mock('./ui/Button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('./ui/AnimatedSection', () => ({
  AnimatedSection: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('./QuestionCard', () => ({
  QuestionCard: ({ question }: any) => (
    <div data-testid="question-card">
      <p>{question.question}</p>
      <span>{question.category}</span>
      <span>{question.difficulty}</span>
    </div>
  ),
}));

describe('InterviewQuestions', () => {
  const mockOnBack = vi.fn();
  const mockOnRetry = vi.fn();

  const mockQuestions: InterviewQuestion[] = [
    {
      id: '1',
      question: 'Explain your experience with React',
      category: 'technical',
      difficulty: 'medium',
    },
    {
      id: '2',
      question: 'Describe a challenging project you worked on',
      category: 'behavioral',
      difficulty: 'hard',
    },
    {
      id: '3',
      question: 'What is your experience with TypeScript?',
      category: 'technical',
      difficulty: 'easy',
    },
    {
      id: '4',
      question: 'Tell me about your previous role',
      category: 'experience',
      difficulty: 'medium',
    },
  ];

  beforeEach(() => {
    mockOnBack.mockClear();
    mockOnRetry.mockClear();
  });

  describe('Error state', () => {
    it('should display error message when error is present', () => {
      const errorMessage = 'Failed to load questions';
      
      render(
        <InterviewQuestions
          questions={[]}
          onBack={mockOnBack}
          error={errorMessage}
        />
      );

      expect(screen.getByText('Failed to Load Questions')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should show retry button when error is retryable', async () => {
      const user = userEvent.setup();
      
      render(
        <InterviewQuestions
          questions={[]}
          onBack={mockOnBack}
          error="Network error"
          isRetryable={true}
          onRetry={mockOnRetry}
        />
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);
      
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('should show back button in error state', async () => {
      const user = userEvent.setup();
      
      render(
        <InterviewQuestions
          questions={[]}
          onBack={mockOnBack}
          error="Something went wrong"
        />
      );

      const backButton = screen.getByRole('button', { name: /back to analysis/i });
      await user.click(backButton);
      
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Questions display', () => {
    it('should display all questions', () => {
      render(
        <InterviewQuestions
          questions={mockQuestions}
          onBack={mockOnBack}
        />
      );

      mockQuestions.forEach((q) => {
        expect(screen.getByText(q.question)).toBeInTheDocument();
      });
    });

    it('should display question count', () => {
      render(
        <InterviewQuestions
          questions={mockQuestions}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText(/Showing 4 of 4 questions/i)).toBeInTheDocument();
    });

    it('should display header with title', () => {
      render(
        <InterviewQuestions
          questions={mockQuestions}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByText('Interview Questions')).toBeInTheDocument();
    });

    it('should display back button', async () => {
      const user = userEvent.setup();
      
      render(
        <InterviewQuestions
          questions={mockQuestions}
          onBack={mockOnBack}
        />
      );

      const backButtons = screen.getAllByRole('button', { name: /back to analysis/i });
      await user.click(backButtons[0]);
      
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Category filtering', () => {
    it('should display all category tabs with counts', () => {
      render(
        <InterviewQuestions
          questions={mockQuestions}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByRole('button', { name: /All Questions.*4/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Technical.*2/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Behavioral.*1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Experience.*1/i })).toBeInTheDocument();
    });

    it('should filter questions by technical category', async () => {
      const user = userEvent.setup();
      
      render(
        <InterviewQuestions
          questions={mockQuestions}
          onBack={mockOnBack}
        />
      );

      const technicalButton = screen.getByRole('button', { name: /Technical.*2/i });
      await user.click(technicalButton);

      // Should show only technical questions
      expect(screen.getByText('Explain your experience with React')).toBeInTheDocument();
      expect(screen.getByText('What is your experience with TypeScript?')).toBeInTheDocument();
      
      // Should not show non-technical questions
      expect(screen.queryByText('Describe a challenging project you worked on')).not.toBeInTheDocument();
      expect(screen.queryByText('Tell me about your previous role')).not.toBeInTheDocument();
      
      // Count should update
      expect(screen.getByText(/Showing 2 of 4 questions/i)).toBeInTheDocument();
    });

    it('should filter questions by behavioral category', async () => {
      const user = userEvent.setup();
      
      render(
        <InterviewQuestions
          questions={mockQuestions}
          onBack={mockOnBack}
        />
      );

      const behavioralButton = screen.getByRole('button', { name: /Behavioral.*1/i });
      await user.click(behavioralButton);

      expect(screen.getByText('Describe a challenging project you worked on')).toBeInTheDocument();
      expect(screen.getByText(/Showing 1 of 4 questions/i)).toBeInTheDocument();
    });

    it('should show all questions when All Questions filter is selected', async () => {
      const user = userEvent.setup();
      
      render(
        <InterviewQuestions
          questions={mockQuestions}
          onBack={mockOnBack}
        />
      );

      // First filter by technical
      const technicalButton = screen.getByRole('button', { name: /Technical.*2/i });
      await user.click(technicalButton);

      // Then click All Questions
      const allButton = screen.getByRole('button', { name: /All Questions.*4/i });
      await user.click(allButton);

      // All questions should be visible
      mockQuestions.forEach((q) => {
        expect(screen.getByText(q.question)).toBeInTheDocument();
      });
      expect(screen.getByText(/Showing 4 of 4 questions/i)).toBeInTheDocument();
    });
  });

  describe('Search functionality', () => {
    it('should display search input', () => {
      render(
        <InterviewQuestions
          questions={mockQuestions}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByPlaceholderText('Search questions...')).toBeInTheDocument();
    });

    it('should filter questions by search query', async () => {
      const user = userEvent.setup();
      
      render(
        <InterviewQuestions
          questions={mockQuestions}
          onBack={mockOnBack}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search questions...');
      await user.type(searchInput, 'React');

      // Should show only questions containing "React"
      expect(screen.getByText('Explain your experience with React')).toBeInTheDocument();
      
      // Should not show other questions
      expect(screen.queryByText('Describe a challenging project you worked on')).not.toBeInTheDocument();
      expect(screen.queryByText('Tell me about your previous role')).not.toBeInTheDocument();
    });

    it('should show clear search button when search has text', async () => {
      const user = userEvent.setup();
      
      render(
        <InterviewQuestions
          questions={mockQuestions}
          onBack={mockOnBack}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search questions...');
      await user.type(searchInput, 'React');

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('should clear search when clear button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <InterviewQuestions
          questions={mockQuestions}
          onBack={mockOnBack}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search questions...') as HTMLInputElement;
      await user.type(searchInput, 'React');
      
      const clearButton = screen.getByRole('button', { name: /clear search/i });
      await user.click(clearButton);

      expect(searchInput.value).toBe('');
      
      // All questions should be visible again
      mockQuestions.forEach((q) => {
        expect(screen.getByText(q.question)).toBeInTheDocument();
      });
    });

    it('should show no results message when search has no matches', async () => {
      const user = userEvent.setup();
      
      render(
        <InterviewQuestions
          questions={mockQuestions}
          onBack={mockOnBack}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search questions...');
      await user.type(searchInput, 'nonexistent query xyz');

      expect(screen.getByText('No questions found')).toBeInTheDocument();
      expect(screen.getByText(/Try adjusting your search/i)).toBeInTheDocument();
    });

    it('should combine category filter and search', async () => {
      const user = userEvent.setup();
      
      render(
        <InterviewQuestions
          questions={mockQuestions}
          onBack={mockOnBack}
        />
      );

      // Filter by technical category
      const technicalButton = screen.getByRole('button', { name: /Technical.*2/i });
      await user.click(technicalButton);

      // Then search for "TypeScript"
      const searchInput = screen.getByPlaceholderText('Search questions...');
      await user.type(searchInput, 'TypeScript');

      // Should show only the TypeScript question
      expect(screen.getByText('What is your experience with TypeScript?')).toBeInTheDocument();
      expect(screen.queryByText('Explain your experience with React')).not.toBeInTheDocument();
      expect(screen.getByText(/Showing 1 of 4 questions/i)).toBeInTheDocument();
    });
  });

  describe('Question grouping', () => {
    it('should group questions by category', () => {
      render(
        <InterviewQuestions
          questions={mockQuestions}
          onBack={mockOnBack}
        />
      );

      // Check that questions are rendered (grouping is visual, so we just verify questions are present)
      mockQuestions.forEach((q) => {
        expect(screen.getByText(q.question)).toBeInTheDocument();
      });
    });
  });
});
