export interface AnalysisResult {
  isPerfect: boolean;
  overallScore: number;
  summary: string;
  suggestions: string[];
  unnecessaryItems: string[];
  strengths: string[];
  formattingFeedback: string[];
  keywordAnalysis: {
    score: number;
    missingKeywords: string[];
    presentKeywords: string[];
  };
  // Optional legacy fields if needed for transition, but we should rely on new ones
  categories?: { [key: string]: number };
}

export interface InterviewQuestion {
  id?: string;
  question: string;
  category: 'technical' | 'behavioral' | 'experience';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuestionsResult {
  questions: InterviewQuestion[];
}

export type ViewType = 'upload' | 'analysis' | 'questions';
