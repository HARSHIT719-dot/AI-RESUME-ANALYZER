import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { CheckCircle, AlertCircle, FileText, X } from 'lucide-react';
import { UploadZone } from './UploadZone';
import { TypingText } from './ui/TypingText';
import { useFileUpload } from '../hooks/useFileUpload';
// import { celebrateWithConfetti } from '../utils/confetti';

interface UploadContainerProps {
  onUploadSuccess: (file: File, text: string) => void;
  onViewChange?: (view: 'analysis') => void;
}

export const UploadContainer: React.FC<UploadContainerProps> = ({
  onUploadSuccess,
  onViewChange
}) => {
  const { file, isUploading, error, uploadFile, clearFile } = useFileUpload();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileSelect = async (selectedFile: File) => {
    setUploadProgress(0);
    setShowSuccess(false);

    // Simulate progress animation
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    await uploadFile(
      selectedFile,
      (extractedText) => {
        // Success callback
        clearInterval(progressInterval);
        setUploadProgress(100);
        setShowSuccess(true);

        // Show success toast
        toast.success('Resume uploaded successfully!', {
          icon: <CheckCircle className="w-5 h-5" />,
        });

        // Call parent success handler
        onUploadSuccess(selectedFile, extractedText);

        // Transition to analysis view after a short delay
        setTimeout(() => {
          if (onViewChange) {
            onViewChange('analysis');
          }
        }, 1500);
      },
      (errorMessage) => {
        // Error callback
        clearInterval(progressInterval);
        setUploadProgress(0);

        // Show error toast
        toast.error(errorMessage, {
          icon: <AlertCircle className="w-5 h-5" />,
          duration: 4000,
        });
      }
    );
  };

  const handleRemoveFile = () => {
    clearFile();
    setUploadProgress(0);
    setShowSuccess(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4 mb-8 relative"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold bg-clip-text text-transparent
                   bg-gradient-to-r from-light-title-start to-light-title-end
                   dark:from-dark-title-start dark:to-dark-title-end relative">
          AI Resume Analyzer
        </h1>

        <div className="text-base sm:text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto"
          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
          <TypingText
            text="Upload your resume and get instant AI-powered insights"
            speed={40}
          />
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <motion.div
            whileHover={{
              scale: 1.02,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
              }
            }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-pill-smart-start to-pill-smart-end text-white border border-transparent backdrop-blur-sm cursor-pointer
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="text-sm"> Smart Analysis</span>
          </motion.div>
          <motion.div
            whileHover={{
              scale: 1.02,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
              }
            }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-pill-instant-start to-pill-instant-end text-white border border-transparent backdrop-blur-sm cursor-pointer
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="text-sm"> Instant Results</span>
          </motion.div>
          <motion.div
            whileHover={{
              scale: 1.02,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
              }
            }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-pill-ai-start to-pill-ai-end text-white border border-transparent backdrop-blur-sm cursor-pointer
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="text-sm"> AI Powered</span>
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!file && !isUploading && (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <UploadZone
              onFileSelect={handleFileSelect}
              isUploading={isUploading}
            />

            {/* Sample Resume Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toast('You are still trying in your career', { icon: '😂' })}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 transition-all duration-300 backdrop-blur-sm"
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">Try with Sample Resume</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {isUploading && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Progress indicator */}
            <div className="relative overflow-hidden rounded-xl p-8 backdrop-blur-xl bg-card border border-border">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-foreground">
                    Processing your resume...
                  </span>
                  <span className="text-primary font-bold">
                    {uploadProgress}%
                  </span>
                </div>

                {/* Animated progress bar */}
                <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />

                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ['-100%', '200%']
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  />
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  Extracting text and analyzing content...
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {file && !isUploading && (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* File Preview */}
            <div className="relative overflow-hidden rounded-xl p-6 backdrop-blur-xl bg-card border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRemoveFile}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Success animation */}
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center space-x-2 text-primary"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 10
                  }}
                >
                  <CheckCircle className="w-6 h-6" />
                </motion.div>
                <span className="font-semibold">Ready to analyze!</span>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Error state */}
        {error && !isUploading && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-destructive relative z-10"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Upload Failed</p>
                <p className="text-sm text-destructive-foreground mt-1">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
