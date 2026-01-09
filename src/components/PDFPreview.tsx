import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, AlertCircle, RotateCw } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { LoadingSpinner } from './ui/LoadingSpinner';
import toast from 'react-hot-toast';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFPreviewProps {
  file: File;
  onError?: (error: string) => void;
  highlightSections?: Array<{
    page: number;
    coordinates?: { x: number; y: number; width: number; height: number };
  }>;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ file, onError, highlightSections }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageInputValue, setPageInputValue] = useState<string>('1');
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; distance: number } | null>(null);

  // Load PDF document
  useEffect(() => {
    const loadPDF = async () => {
      setIsLoading(true);
      setError(null);
      setIsRetrying(false);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setIsLoading(false);
        toast.success('PDF loaded successfully');
      } catch (err) {
        const errorMessage = 'Failed to load PDF. The file may be corrupted.';
        setError(errorMessage);
        setIsLoading(false);
        onError?.(errorMessage);
        console.error('PDF loading error:', err);
      }
    };

    loadPDF();
  }, [file, onError]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return; // Don't interfere with input fields
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          handlePreviousPage();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          handleNextPage();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleFitToWidth();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, numPages, scale]);

  // Touch controls for mobile
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        touchStartRef.current = {
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2,
          distance,
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStartRef.current) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        const scaleDelta = distance / touchStartRef.current.distance;
        const newScale = Math.min(3.0, Math.max(0.5, scale * scaleDelta));
        setScale(newScale);
        
        touchStartRef.current.distance = distance;
      }
    };

    const handleTouchEnd = () => {
      touchStartRef.current = null;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scale]);

  // Render current page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isCancelled = false;
    let currentRenderTask: pdfjsLib.RenderTask | null = null;

    const renderPage = async () => {
      try {
        if (isCancelled) return;
        
        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;
        
        const canvas = canvasRef.current;
        if (!canvas || isCancelled) return;

        const context = canvas.getContext('2d');
        if (!context || isCancelled) return;

        const viewport = page.getViewport({ scale });
        
        // Clear canvas before rendering
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        currentRenderTask = page.render(renderContext);
        
        try {
          await currentRenderTask.promise;
          if (!isCancelled) {
            currentRenderTask = null;
          }
        } catch (err: any) {
          if (err?.name === 'RenderingCancelledException') {
            // Expected when cancelling, ignore
            return;
          }
          throw err;
        }
      } catch (err: any) {
        if (!isCancelled && err?.name !== 'RenderingCancelledException') {
          console.error('Page rendering error:', err);
          setError('Failed to render PDF page');
        }
      }
    };

    renderPage();

    // Cleanup function to cancel render task on unmount or dependency change
    return () => {
      isCancelled = true;
      if (currentRenderTask) {
        try {
          currentRenderTask.cancel();
        } catch (e) {
          // Ignore errors during cancellation
        }
      }
    };
  }, [pdfDoc, currentPage, scale]);

  const handlePreviousPage = () => {
    const newPage = Math.max(1, currentPage - 1);
    setCurrentPage(newPage);
    setPageInputValue(newPage.toString());
  };

  const handleNextPage = () => {
    const newPage = Math.min(numPages, currentPage + 1);
    setCurrentPage(newPage);
    setPageInputValue(newPage.toString());
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(e.target.value);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(pageInputValue, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum);
      toast.success(`Jumped to page ${pageNum}`);
    } else {
      setPageInputValue(currentPage.toString());
      toast.error(`Invalid page number. Must be between 1 and ${numPages}`);
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(3.0, prev + 0.25));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.5, prev - 0.25));
  };

  const handleResetZoom = () => {
    setScale(1.0);
    toast.success('Zoom reset to 100%');
  };

  const handleFitToWidth = () => {
    if (containerRef.current && canvasRef.current) {
      const containerWidth = containerRef.current.clientWidth - 32;
      const canvasWidth = canvasRef.current.width / scale;
      const newScale = containerWidth / canvasWidth;
      setScale(Math.min(3.0, Math.max(0.5, newScale)));
      toast.success('Fitted to width');
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setError(null);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
      setIsRetrying(false);
      toast.success('PDF loaded successfully');
    } catch (err) {
      const errorMessage = 'Failed to load PDF. The file may be corrupted.';
      setError(errorMessage);
      setIsRetrying(false);
      toast.error(errorMessage);
      console.error('PDF loading error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-400">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
        <div className="text-center px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">PDF Preview Error</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            <RotateCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Retrying...' : 'Retry'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 p-3 border-b border-white/10 bg-white/5">
        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="p-2 sm:p-2.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation"
            title="Previous page (Arrow Left)"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
            <span className="text-xs sm:text-sm text-gray-400">Page</span>
            <input
              type="number"
              min="1"
              max={numPages}
              value={pageInputValue}
              onChange={handlePageInputChange}
              className="w-12 sm:w-14 px-2 py-1 text-xs sm:text-sm text-center bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Page number"
            />
            <span className="text-xs sm:text-sm text-gray-400">of {numPages}</span>
          </form>
          
          <button
            onClick={handleNextPage}
            disabled={currentPage >= numPages}
            aria-label="Next page"
            className="p-2 sm:p-2.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation"
            title="Next page (Arrow Right)"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            aria-label="Zoom out"
            className="p-2 sm:p-2.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation"
            title="Zoom out (-)"
          >
            <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <button
            onClick={handleResetZoom}
            className="text-xs sm:text-sm text-gray-300 min-w-[50px] text-center px-2 py-1 rounded hover:bg-white/10 transition-colors"
            title="Reset zoom (0)"
          >
            {Math.round(scale * 100)}%
          </button>
          
          <button
            onClick={handleZoomIn}
            disabled={scale >= 3.0}
            aria-label="Zoom in"
            className="p-2 sm:p-2.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation"
            title="Zoom in (+)"
          >
            <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <button
            onClick={handleFitToWidth}
            aria-label="Fit to width"
            className="p-2 sm:p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 touch-manipulation"
            title="Fit to width (0)"
          >
            <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center"
        >
          <canvas
            ref={canvasRef}
            className="shadow-2xl"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </motion.div>
      </div>
    </div>
  );
};
