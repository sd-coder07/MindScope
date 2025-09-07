'use client';

import { AlertTriangle, Camera, RefreshCw } from 'lucide-react';
import { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface TensorFlowErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error) => void;
}

export default function TensorFlowErrorBoundary({ children, onError }: TensorFlowErrorBoundaryProps) {
  const handleError = (error: Error) => {
    console.error('TensorFlow Error:', error);
    
    // Send error to analytics or monitoring service
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'exception', {
        description: `TensorFlow Error: ${error.message}`,
        fatal: false,
      });
    }
    
    if (onError) {
      onError(error);
    }
  };

  const fallback = (
    <div className="min-h-[300px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
      <div className="text-center p-6 max-w-md">
        <Camera className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          AI Feature Unavailable
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          The AI emotion detection feature couldn&apos;t load. This might be due to:
        </p>
        <ul className="text-xs text-gray-600 text-left mb-4 space-y-1">
          <li>• Camera permissions not granted</li>
          <li>• TensorFlow.js model loading failed</li>
          <li>• Browser compatibility issues</li>
          <li>• Network connectivity problems</li>
        </ul>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </button>
          <p className="text-xs text-gray-500">
            You can still use other features while we work on this.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}
