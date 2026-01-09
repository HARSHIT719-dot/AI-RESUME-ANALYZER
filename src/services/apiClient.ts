/**
 * API Client Service
 * Handles communication with the Python Flask backend
 */

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Request/Response Type Definitions
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp?: string;
}

export interface AnalysisRequest {
  resumeText: string;
}

import { AnalysisResult, QuestionsResult } from '../types';

export interface InterviewQuestion {
  question: string;
  category: 'technical' | 'behavioral' | 'experience';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuestionsRequest {
  resumeText: string;
  analysisResult?: {
    summary: string;
    suggestions?: string[];
  };
}

// Custom Error Classes
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  public isRetryable = true;
  
  constructor(message: string = 'Network error. Please check your internet connection.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  public isRetryable = true;
  
  constructor(message: string = 'Request timed out. Please try again.') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class RateLimitError extends Error {
  public isRetryable = true;
  
  constructor(message: string = 'Too many requests. Please wait a moment and try again.') {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Make a fetch request with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new TimeoutError();
      }
      if (error.message.includes('fetch') || error.message.includes('network')) {
        throw new NetworkError();
      }
    }
    throw error;
  }
}

/**
 * Get user-friendly error message based on error code
 */
function getUserFriendlyMessage(code: string, defaultMessage: string): string {
  const errorMessages: Record<string, string> = {
    'AI_SERVICE_UNAVAILABLE': 'AI service is currently unavailable. Please try again later.',
    'MISSING_RESUME_TEXT': 'Resume text is missing. Please upload a valid resume.',
    'EMPTY_RESUME_TEXT': 'Resume text is empty. Please upload a resume with content.',
    'RESUME_TOO_SHORT': 'Resume is too short. Please upload a complete resume.',
    'INVALID_CONTENT_TYPE': 'Invalid request format. Please try again.',
    'API_KEY_ERROR': 'Service configuration error. Please contact support.',
    'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait a moment and try again.',
    'REQUEST_TIMEOUT': 'Request timed out. Please check your connection and try again.',
    'CONNECTION_FAILED': 'Connection failed. Please check your internet connection.',
    'ANALYSIS_FAILED': 'Analysis failed. Please try again.',
    'QUESTION_GENERATION_FAILED': 'Failed to generate questions. Please try again.',
    'INTERNAL_ERROR': 'An unexpected error occurred. Please try again.',
    'FILE_TOO_LARGE': 'File is too large. Maximum size is 10MB.',
    'BAD_REQUEST': 'Invalid request. Please check your input.',
    'NOT_FOUND': 'Requested resource not found.',
    'METHOD_NOT_ALLOWED': 'Invalid request method.',
    'INTERNAL_SERVER_ERROR': 'Server error. Please try again later.',
  };

  return errorMessages[code] || defaultMessage;
}

/**
 * Determine if an error is retryable based on status code and error code
 */
function isRetryableError(statusCode: number, errorCode?: string): boolean {
  // Retryable status codes
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  
  // Retryable error codes
  const retryableErrorCodes = [
    'RATE_LIMIT_EXCEEDED',
    'REQUEST_TIMEOUT',
    'CONNECTION_FAILED',
    'INTERNAL_ERROR',
    'INTERNAL_SERVER_ERROR',
  ];
  
  return retryableStatusCodes.includes(statusCode) || 
         (errorCode ? retryableErrorCodes.includes(errorCode) : false);
}

/**
 * Handle API response and extract data or throw appropriate error
 */
async function handleResponse<T>(response: Response): Promise<T> {
  let data: ApiResponse<T>;
  
  try {
    data = await response.json();
  } catch (error) {
    throw new ApiError(
      'Invalid response from server',
      'INVALID_RESPONSE',
      response.status,
      false
    );
  }

  if (!response.ok || !data.success) {
    const errorCode = data.code || 'UNKNOWN_ERROR';
    const defaultMessage = `Request failed with status ${response.status}`;
    const errorMessage = data.error || defaultMessage;
    const userFriendlyMessage = getUserFriendlyMessage(errorCode, errorMessage);
    const retryable = isRetryableError(response.status, errorCode);
    
    // Handle rate limiting specifically
    if (response.status === 429 || errorCode === 'RATE_LIMIT_EXCEEDED') {
      throw new RateLimitError(userFriendlyMessage);
    }
    
    throw new ApiError(userFriendlyMessage, errorCode, response.status, retryable);
  }

  if (!data.data) {
    throw new ApiError(
      'No data in response',
      'NO_DATA',
      response.status,
      false
    );
  }

  return data.data;
}

/**
 * Analyze resume content
 */
export async function analyzeResume(resumeText: string): Promise<AnalysisResult> {
  if (!resumeText || resumeText.trim().length === 0) {
    throw new ApiError('Resume text cannot be empty', 'EMPTY_RESUME_TEXT', 400);
  }

  const url = `${API_BASE_URL}/api/analyze`;
  const requestBody: AnalysisRequest = { resumeText };

  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    return await handleResponse<AnalysisResult>(response);
  } catch (error) {
    // Re-throw known errors
    if (error instanceof ApiError || error instanceof NetworkError || error instanceof TimeoutError || error instanceof RateLimitError) {
      throw error;
    }
    
    // Wrap unknown errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to analyze resume',
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * Generate interview questions based on resume
 */
export async function generateQuestions(
  resumeText: string,
  analysisResult?: { summary: string; suggestions?: string[] }
): Promise<InterviewQuestion[]> {
  if (!resumeText || resumeText.trim().length === 0) {
    throw new ApiError('Resume text cannot be empty', 'EMPTY_RESUME_TEXT', 400);
  }

  const url = `${API_BASE_URL}/api/generate-questions`;
  const requestBody: QuestionsRequest = {
    resumeText,
    analysisResult,
  };

  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const result = await handleResponse<QuestionsResult>(response);
    return result.questions;
  } catch (error) {
    // Re-throw known errors
    if (error instanceof ApiError || error instanceof NetworkError || error instanceof TimeoutError || error instanceof RateLimitError) {
      throw error;
    }
    
    // Wrap unknown errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to generate questions',
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * Check backend health status
 */
export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  const url = `${API_BASE_URL}/api/health`;

  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
    }, 5000); // Shorter timeout for health check

    if (!response.ok) {
      throw new ApiError('Health check failed', 'HEALTH_CHECK_FAILED', response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError || error instanceof NetworkError || error instanceof TimeoutError) {
      throw error;
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : 'Health check failed',
      'UNKNOWN_ERROR'
    );
  }
}
