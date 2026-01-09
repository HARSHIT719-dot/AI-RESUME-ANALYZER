import { useState, lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { AnimatedBackground } from './components/AnimatedBackground';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { UploadContainer } from './components/UploadContainer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineIndicator } from './components/OfflineIndicator';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { PDFPreview } from './components/PDFPreview';
import { SplitLayout } from './components/SplitLayout';
import { useAnalysis } from './hooks/useAnalysis';
import { pageTransition } from './utils/animations';
import type { ViewType } from './types';

// Lazy load heavy components for better initial load performance
const AnalysisResults = lazy(() => import('./components/AnalysisResults').then(module => ({ default: module.AnalysisResults })));
const InterviewQuestions = lazy(() => import('./components/InterviewQuestions').then(module => ({ default: module.InterviewQuestions })));

function App() {
  // State management
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [currentView, setCurrentView] = useState<ViewType>('upload');
  
  // Use analysis hook
  const {
    analysisResult,
    interviewQuestions,
    isAnalyzing,
    isGeneratingQuestions,
    analyzeResume,
    generateQuestions,
    retryLastOperation,
    error,
    isRetryable,
  } = useAnalysis();

  const handleUploadSuccess = async (file: File, text: string) => {
    setUploadedFile(file);
    setResumeText(text);
    
    // Switch to analysis view immediately to show loading state
    setCurrentView('analysis');
    
    // Automatically analyze the resume
    try {
      await analyzeResume(text);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze resume. Please try again.');
      // Stay on analysis view to show the error
    }
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  const handleGenerateQuestions = async () => {
    if (!resumeText || !analysisResult) {
      toast.error('Resume analysis is required to generate questions');
      return;
    }

    try {
      await generateQuestions(resumeText, analysisResult);
      
      // Only switch to questions view if generation was successful
      if (!error) {
        setCurrentView('questions');
      }
    } catch (err) {
      // Error is already handled in the hook, but we can show a retry option
      toast.error(
        (t) => (
          <div className="flex flex-col gap-2">
            <span>Failed to generate questions</span>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleGenerateQuestions();
              }}
              className="text-sm underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        ),
        { duration: 5000 }
      );
    }
  };

  const handleBackToAnalysis = () => {
    setCurrentView('analysis');
  };

  // Import refined page transitions from centralized config
  // (pageTransition is imported from utils/animations)

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col text-foreground">
        {/* Skip to main content link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>
        
        <AnimatedBackground withParticles />
        <OfflineIndicator />
        
        <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(26, 26, 46, 0.9)',
            color: '#fff',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#06b6d4',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ec4899',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Header />
      
      <main id="main-content" className="flex-1 container mx-auto px-3 sm:px-4 py-6 sm:py-8" role="main">
        <AnimatePresence mode="wait">
          {currentView === 'upload' && (
            <motion.div
              key="upload"
              {...pageTransition}
            >
              <UploadContainer 
                onUploadSuccess={handleUploadSuccess}
                onViewChange={handleViewChange}
              />
            </motion.div>
          )}
          
          {currentView === 'analysis' && uploadedFile && (
            <motion.div
              key="analysis"
              {...pageTransition}
            >
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                  <LoadingSpinner size="xl" />
                </div>
              }>
                <SplitLayout
                  leftPanel={<PDFPreview file={uploadedFile} />}
                  rightPanel={
                    <AnalysisResults
                      result={analysisResult}
                      isLoading={isAnalyzing}
                      onGenerateQuestions={handleGenerateQuestions}
                      isGeneratingQuestions={isGeneratingQuestions}
                      error={error}
                      isRetryable={isRetryable}
                      onRetry={retryLastOperation}
                    />
                  }
                />
              </Suspense>
            </motion.div>
          )}
          
          {currentView === 'questions' && interviewQuestions && uploadedFile && (
            <motion.div
              key="questions"
              {...pageTransition}
            >
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                  <LoadingSpinner size="xl" />
                </div>
              }>
                <SplitLayout
                  leftPanel={<PDFPreview file={uploadedFile} />}
                  rightPanel={
                    <InterviewQuestions
                      questions={interviewQuestions}
                      onBack={handleBackToAnalysis}
                    />
                  }
                />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
