'use client';

import { AlertTriangle, Camera, Settings } from 'lucide-react';
import { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface CameraErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error) => void;
}

export default function CameraErrorBoundary({ children, onError }: CameraErrorBoundaryProps) {
  const handleError = (error: Error) => {
    console.error('Camera Error:', error);
    
    if (onError) {
      onError(error);
    }
  };

  const requestCameraAccess = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      window.location.reload();
    } catch (err) {
      console.error('Camera access request failed:', err);
      alert('Camera access is required for this feature. Please enable camera permissions in your browser settings.');
    }
  };

  const fallback = (
    <div className="min-h-[250px] flex items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-200">
      <div className="text-center p-6 max-w-md">
        <Camera className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Camera Access Required
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          This feature needs camera access to detect emotions and provide personalized wellness insights.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={requestCameraAccess}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Camera className="w-4 h-4" />
            Enable Camera
          </button>
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <strong>Privacy Note:</strong> All camera processing happens locally on your device. No video data is sent to our servers.
            </div>
          </div>
          <button
            onClick={() => window.open('chrome://settings/content/camera', '_blank')}
            className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Settings className="w-3 h-3" />
            Browser Camera Settings
          </button>
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
