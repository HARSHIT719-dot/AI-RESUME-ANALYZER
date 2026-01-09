import { useState, useCallback } from 'react';
import { PDFService } from '../services/PDFService';

interface UseFileUploadReturn {
  file: File | null;
  isUploading: boolean;
  error: string | null;
  uploadFile: (file: File, onSuccess?: (text: string) => void, onError?: (error: string) => void) => Promise<void>;
  clearFile: () => void;
  clearError: () => void;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (
      uploadedFile: File,
      onSuccess?: (text: string) => void,
      onError?: (error: string) => void
    ): Promise<void> => {
      setIsUploading(true);
      setError(null);

      try {
        // Extract text from PDF using PDFService
        const extractedText = await PDFService.extractText(uploadedFile);

        // Update state with the uploaded file
        setFile(uploadedFile);

        // Call success callback if provided
        if (onSuccess) {
          onSuccess(extractedText);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
        setError(errorMessage);
        setFile(null);

        // Call error callback if provided
        if (onError) {
          onError(errorMessage);
        }
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const clearFile = useCallback(() => {
    setFile(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    file,
    isUploading,
    error,
    uploadFile,
    clearFile,
    clearError,
  };
};
