import { useState, useEffect } from 'react';
import { useCamera } from '../hooks/useCamera';
import ocrService from '../services/ocr';

export default function CameraCapture({ onCapture, onClose }) {
  const { videoRef, isActive, error, startCamera, stopCamera, capturePhoto } = useCamera();
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    const imageData = capturePhoto();
    setCapturedImage(imageData);
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleProcess = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    try {
      const productData = await ocrService.parseLabel(capturedImage);
      onCapture(productData);
    } catch (err) {
      alert('Failed to parse label. Please try again or enter manually.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Scan Product Label</h2>
        <button
          onClick={onClose}
          className="text-2xl"
        >
          ✕
        </button>
      </div>

      {/* Camera/Image View */}
      <div className="flex-1 relative flex items-center justify-center bg-black">
        {error ? (
          <div className="text-white text-center p-4">
            <div className="text-4xl mb-4">⚠️</div>
            <p>{error}</p>
          </div>
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="max-w-full max-h-full object-contain"
            />
            {/* Overlay guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-2 border-white border-dashed rounded-lg w-4/5 h-3/5 flex items-center justify-center">
                <span className="text-white bg-black bg-opacity-50 px-4 py-2 rounded">
                  Align label within frame
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4">
        {capturedImage ? (
          <div className="flex gap-3">
            <button
              onClick={handleRetake}
              className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-medium"
              disabled={isProcessing}
            >
              Retake
            </button>
            <button
              onClick={handleProcess}
              className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Use Photo'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleCapture}
            className="w-full bg-white text-gray-900 py-4 rounded-full font-medium text-lg disabled:opacity-50"
            disabled={!isActive}
          >
            📷 Capture
          </button>
        )}

        <div className="text-center mt-3 text-sm text-gray-400">
          <p>Position the product label clearly in the frame</p>
          <p>Make sure all text is visible and well-lit</p>
        </div>
      </div>
    </div>
  );
}
