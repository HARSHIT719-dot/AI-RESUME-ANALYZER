import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log error details for debugging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    // Store error in sessionStorage for debugging
    try {
      const errors = JSON.parse(sessionStorage.getItem('app_errors') || '[]');
      errors.push(errorDetails);
      sessionStorage.setItem('app_errors', JSON.stringify(errors.slice(-5))); // Keep last 5 errors
    } catch (e) {
      console.error('Failed to store error in sessionStorage:', e);
    }
    
    this.setState({
      errorInfo: errorInfo.componentStack || null,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <GlassCard className="max-w-2xl w-full p-8">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              
              <div>
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                  Oops! Something went wrong
                </h1>
                <p className="text-gray-300 text-lg">
                  We encountered an unexpected error. Don't worry, your data is safe.
                </p>
              </div>

              {this.state.error && (
                <div className="w-full bg-black/20 rounded-lg p-4 text-left">
                  <p className="text-sm font-mono text-red-300 break-words">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={this.handleReset}
                  variant="primary"
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Application
                </Button>
              </div>

              <p className="text-sm text-gray-400">
                If this problem persists, please try clearing your browser cache or contact support.
              </p>
            </div>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}
