import { useState } from 'react';
import { AnalysisResult, InterviewQuestion } from '../types';
import * as apiClient from '../services/apiClient';

interface UseAnalysisReturn {
  analysisResult: AnalysisResult | null;
  interviewQuestions: InterviewQuestion[] | null;
  isAnalyzing: boolean;
  isGeneratingQuestions: boolean;
  error: string | null;
  isRetryable: boolean;
  analyzeResume: (resumeText: string) => Promise<void>;
  generateQuestions: (resumeText: string, analysisResult: AnalysisResult) => Promise<void>;
  retryLastOperation: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

type LastOperation = 
  | { type: 'analyze'; resumeText: string }
  | { type: 'questions'; resumeText: string; analysisResult: AnalysisResult }
  | null;

export const useAnalysis = (): UseAnalysisReturn => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRetryable, setIsRetryable] = useState(false);
  const [lastOperation, setLastOperation] = useState<LastOperation>(null);

  const analyzeResume = async (resumeText: string): Promise<void> => {
    if (!resumeText || resumeText.trim().length === 0) {
      setError('Resume text is empty. Please upload a valid resume.');
      setIsRetryable(false);
      return;
    }

    // Check for minimum content length
    if (resumeText.trim().length < 50) {
      setError('Resume is too short. Please upload a complete resume with sufficient content.');
      setIsRetryable(false);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setIsRetryable(false);
    setLastOperation({ type: 'analyze', resumeText });

    try {
      const result = await apiClient.analyzeResume(resumeText);
      setAnalysisResult(result);
      setLastOperation(null); // Clear on success
    } catch (err) {
      let errorMessage = 'Failed to analyze resume';
      let retryable = false;
      
      if (err instanceof apiClient.RateLimitError) {
        errorMessage = err.message;
        retryable = err.isRetryable;
      } else if (err instanceof apiClient.ApiError) {
        errorMessage = err.message;
        retryable = err.isRetryable;
      } else if (err instanceof apiClient.NetworkError) {
        errorMessage = err.message;
        retryable = err.isRetryable;
      } else if (err instanceof apiClient.TimeoutError) {
        errorMessage = err.message;
        retryable = err.isRetryable;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsRetryable(retryable);
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateQuestions = async (
    resumeText: string,
    analysisResult: AnalysisResult
  ): Promise<void> => {
    if (!resumeText || resumeText.trim().length === 0) {
      setError('Resume text is required to generate questions.');
      setIsRetryable(false);
      return;
    }

    if (!analysisResult) {
      setError('Analysis result is required to generate questions.');
      setIsRetryable(false);
      return;
    }

    setIsGeneratingQuestions(true);
    setError(null);
    setIsRetryable(false);
    setLastOperation({ type: 'questions', resumeText, analysisResult });

    try {
      const questions = await apiClient.generateQuestions(
        resumeText,
        {
          summary: analysisResult.summary,
          suggestions: analysisResult.suggestions,
        }
      );
      setInterviewQuestions(questions);
      setLastOperation(null); // Clear on success
    } catch (err) {
      let errorMessage = 'Failed to generate interview questions';
      let retryable = false;
      
      if (err instanceof apiClient.RateLimitError) {
        errorMessage = err.message;
        retryable = err.isRetryable;
      } else if (err instanceof apiClient.ApiError) {
        errorMessage = err.message;
        retryable = err.isRetryable;
      } else if (err instanceof apiClient.NetworkError) {
        errorMessage = err.message;
        retryable = err.isRetryable;
      } else if (err instanceof apiClient.TimeoutError) {
        errorMessage = err.message;
        retryable = err.isRetryable;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsRetryable(retryable);
      setInterviewQuestions(null);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const retryLastOperation = async (): Promise<void> => {
    if (!lastOperation) {
      return;
    }

    if (lastOperation.type === 'analyze') {
      await analyzeResume(lastOperation.resumeText);
    } else if (lastOperation.type === 'questions') {
      await generateQuestions(lastOperation.resumeText, lastOperation.analysisResult);
    }
  };

  const clearError = (): void => {
    setError(null);
    setIsRetryable(false);
  };

  const reset = (): void => {
    setAnalysisResult(null);
    setInterviewQuestions(null);
    setError(null);
    setIsRetryable(false);
    setIsAnalyzing(false);
    setIsGeneratingQuestions(false);
    setLastOperation(null);
  };

  return {
    analysisResult,
    interviewQuestions,
    isAnalyzing,
    isGeneratingQuestions,
    error,
    isRetryable,
    analyzeResume,
    generateQuestions,
    retryLastOperation,
    clearError,
    reset,
  };
};
