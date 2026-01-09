import { useState, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  data: any | null;
}

interface UseLoadingStateReturn<T> {
  isLoading: boolean;
  error: Error | null;
  data: T | null;
  execute: (asyncFn: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

/**
 * Hook for managing loading states with error handling
 */
export const useLoadingState = <T = any>(): UseLoadingStateReturn<T> => {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    data: null,
  });

  const execute = useCallback(async (asyncFn: () => Promise<T>): Promise<T | null> => {
    setState({ isLoading: true, error: null, data: null });

    try {
      const result = await asyncFn();
      setState({ isLoading: false, error: null, data: result });
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('An unknown error occurred');
      setState({ isLoading: false, error: err, data: null });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, data: null });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  return {
    isLoading: state.isLoading,
    error: state.error,
    data: state.data as T | null,
    execute,
    reset,
    setData,
  };
};
