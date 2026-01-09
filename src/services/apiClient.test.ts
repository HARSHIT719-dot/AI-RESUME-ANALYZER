import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  analyzeResume,
  generateQuestions,
  checkHealth,
  ApiError,
  NetworkError,
  TimeoutError,
  RateLimitError,
} from './apiClient';

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe('API Client Service', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('analyzeResume', () => {
    it('should successfully analyze resume with valid text', async () => {
      const mockResponse = {
        success: true,
        data: {
          isPerfect: false,
          suggestions: ['Add more quantifiable achievements'],
          unnecessaryItems: ['Remove objective statement'],
          summary: 'Good resume with room for improvement',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await analyzeResume('Sample resume text');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analyze'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText: 'Sample resume text' }),
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw ApiError when resume text is empty', async () => {
      await expect(analyzeResume('')).rejects.toThrow(ApiError);
      await expect(analyzeResume('   ')).rejects.toThrow(ApiError);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle API error responses', async () => {
      const mockErrorResponse = {
        success: false,
        error: 'Analysis failed',
        code: 'ANALYSIS_FAILED',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => mockErrorResponse,
      });

      await expect(analyzeResume('Sample resume text')).rejects.toThrow(ApiError);
    });

    it('should handle rate limit errors', async () => {
      const mockErrorResponse = {
        success: false,
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => mockErrorResponse,
      });

      try {
        await analyzeResume('Sample resume text');
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect((error as RateLimitError).message).toContain('Too many requests');
      }
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

      await expect(analyzeResume('Sample resume text')).rejects.toThrow(NetworkError);
    });

    it('should handle timeout errors', async () => {
      // Mock AbortController to simulate timeout
      const mockAbort = vi.fn();
      const originalAbortController = globalThis.AbortController;

      globalThis.AbortController = class MockAbortController {
        signal = { aborted: false };
        abort = mockAbort;
      } as any;

      mockFetch.mockImplementationOnce(() => {
        const error = new Error('The operation was aborted');
        error.name = 'AbortError';
        return Promise.reject(error);
      });

      await expect(analyzeResume('Sample resume text')).rejects.toThrow(TimeoutError);

      globalThis.AbortController = originalAbortController;
    });
  });

  describe('generateQuestions', () => {
    it('should successfully generate questions with valid input', async () => {
      const mockResponse = {
        success: true,
        data: {
          questions: [
            {
              question: 'Tell me about your experience with React',
              category: 'technical',
              difficulty: 'medium',
            },
            {
              question: 'Describe a challenging project',
              category: 'behavioral',
              difficulty: 'hard',
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await generateQuestions('Sample resume text', {
        summary: 'Good resume',
        suggestions: ['Add more details'],
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/generate-questions'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toEqual(mockResponse.data.questions);
      expect(result).toHaveLength(2);
    });

    it('should throw ApiError when resume text is empty', async () => {
      await expect(generateQuestions('')).rejects.toThrow(ApiError);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle API error responses', async () => {
      const mockErrorResponse = {
        success: false,
        error: 'Question generation failed',
        code: 'QUESTION_GENERATION_FAILED',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => mockErrorResponse,
      });

      await expect(
        generateQuestions('Sample resume text')
      ).rejects.toThrow(ApiError);
    });
  });

  describe('checkHealth', () => {
    it('should successfully check health status', async () => {
      const mockResponse = {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await checkHealth();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/health'),
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle health check failures', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({}),
      });

      await expect(checkHealth()).rejects.toThrow(ApiError);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(analyzeResume('Sample resume text')).rejects.toThrow(ApiError);
    });

    it('should handle missing data in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          // Missing data field
        }),
      });

      await expect(analyzeResume('Sample resume text')).rejects.toThrow(ApiError);
    });

    it('should provide user-friendly error messages', async () => {
      const mockErrorResponse = {
        success: false,
        error: 'Technical error message',
        code: 'AI_SERVICE_UNAVAILABLE',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => mockErrorResponse,
      });

      try {
        await analyzeResume('Sample resume text');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).message).toContain('AI service is currently unavailable');
      }
    });
  });
});
