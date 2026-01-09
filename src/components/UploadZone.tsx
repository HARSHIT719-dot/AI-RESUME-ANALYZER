import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { durations, easings } from '../utils/animations';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  disabled?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ 
  onFileSelect, 
  isUploading = false,
  disabled = false 
}) => {
  const prefersReducedMotion = useReducedMotion();
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const onDropRejected = useCallback((fileRejections: any[]) => {
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      const errors = rejection.errors;
      
      if (errors.some((e: any) => e.code === 'file-invalid-type')) {
        toast.error('Invalid file type. Please upload a PDF file.');
      } else if (errors.some((e: any) => e.code === 'file-too-large')) {
        toast.error('File is too large. Maximum size is 10MB.');
      } else {
        toast.error('File validation failed. Please try another file.');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: disabled || isUploading,
    multiple: false
  });

  const rootProps = getRootProps();
  
  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-[20px] p-6 sm:p-8 md:p-12
        bg-card border border-border transition-all duration-300
        cursor-pointer touch-manipulation
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
        ${isDragActive 
          ? 'border-primary bg-card scale-[1.02] shadow-lg' 
          : 'hover:border-primary hover:shadow-lg'
        }
        ${(disabled || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      whileHover={!disabled && !isUploading && !prefersReducedMotion ? {
        scale: 1.02,
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
        transition: {
          duration: durations.fast,
          ease: easings.snappy,
        }
      } : undefined}
      onClick={rootProps.onClick}
      onKeyDown={rootProps.onKeyDown}
      tabIndex={rootProps.tabIndex}
      role={rootProps.role}
      aria-label="Upload resume PDF file - drag and drop or click to browse"
      aria-disabled={disabled || isUploading}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center justify-center space-y-4 text-center sm:space-y-6">
        <motion.div
          animate={!prefersReducedMotion && isDragActive ? {
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
            transition: {
              duration: 0.5,
              ease: easings.spring,
            }
          } : {}}
          whileHover={!prefersReducedMotion && !isDragActive ? {
            y: -10,
            transition: {
              duration: durations.normal,
              ease: easings.smooth,
            }
          } : undefined}
          className="relative"
        >
          {isDragActive ? (
            <FileText className="w-16 h-16 sm:w-20 sm:h-20 text-primary" />
          ) : (
            <Upload className="w-16 h-16 sm:w-20 sm:h-20 text-primary" />
          )}
          
          {!prefersReducedMotion && !isDragActive && (
            <motion.div
              className="absolute inset-0 rounded-full opacity-0 bg-gradient-to-r from-purple-500/20 via-orange-500/20 to-cyan-500/20 blur-xl"
              whileHover={{
                opacity: [0.2, 0.4, 0.2],
                scale: [1, 1.3, 1],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: easings.gentle,
                }
              }}
            />
          )}
        </motion.div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold sm:text-2xl text-transparent bg-clip-text
                   bg-gradient-to-r from-light-title-start to-light-title-end
                   dark:from-dark-title-start dark:to-dark-title-end">
            {isDragActive ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-light-title-start to-light-title-end dark:from-dark-title-start dark:to-dark-title-end">
                Drop your resume here
              </span>
            ) : (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-light-title-start to-light-title-end dark:from-dark-title-start dark:to-dark-title-end">
                Be Ready for AI Magic
              </span>
            )}
          </h3>
          <p className="text-base font-medium text-muted-foreground sm:text-lg">
            {isDragActive 
              ? '✨ Release to upload' 
              : ' Drag & drop or click to browse your resume'
            }
          </p>
        </div>

        <div className="flex flex-col items-center space-y-2 text-sm">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            <motion.span 
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-upload-btn-primary-light dark:bg-upload-btn-primary-dark text-card-foreground dark:text-white font-medium shadow-md text-xs sm:text-sm"
              whileHover={!prefersReducedMotion ? { 
                scale: 1.05, 
                boxShadow: '0 0 25px rgba(249,115,22,0.5)',
                transition: {
                  duration: durations.fast,
                  ease: easings.snappy,
                }
              } : undefined}
            >
              📄 PDF only
            </motion.span>
            <motion.span 
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-upload-btn-secondary-light dark:bg-upload-btn-secondary-dark text-white font-medium shadow-md text-xs sm:text-sm"
              whileHover={!prefersReducedMotion ? { 
                scale: 1.05, 
                boxShadow: '0 0 25px rgba(6,182,212,0.5)',
                transition: {
                  duration: durations.fast,
                  ease: easings.snappy,
                }
              } : undefined}
            >
              📦 Max 10MB
            </motion.span>
          </div>
        </div>
      </div>

      {/* Decorative gradient borders */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl">
        <div className="absolute inset-0 transition-opacity duration-300 opacity-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-orange-500/20 to-cyan-500/20 hover:opacity-100" />
      </div>
    </motion.div>
  );
};
