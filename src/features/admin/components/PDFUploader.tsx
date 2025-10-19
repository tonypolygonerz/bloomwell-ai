'use client';

import { useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface PDFUploaderProps {
  onProcessingComplete?: (result: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface ProcessingResult {
  summary: string;
  keyPoints: string[];
  documentType: string;
  recommendations: string[];
  confidence: number;
  pageCount: number;
  fileSize: number;
  processingTime: number;
  model: string;
}

interface UsageStats {
  dailyLimit: number;
  used: number;
  remaining: number;
  resetTime: string;
}

export default function PDFUploader({
  onProcessingComplete,
  onError,
  className = '',
}: PDFUploaderProps) {
  const { data: session } = useSession();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('general');
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [processingResult, setProcessingResult] =
    useState<ProcessingResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load usage stats on component mount
  const loadUsageStats = useCallback(async () => {
    try {
      const response = await fetch('/api/pdf/process');
      if (response.ok) {
        const data = await response.json();
        setUsageStats(data.usage);
      }
    } catch (error) {
      console.error('Failed to load usage stats:', error);
    }
  }, []);

  // Load usage stats when component mounts
  useState(() => {
    loadUsageStats();
  });

  // File validation function
  const validateFile = (file: File): string | null => {
    if (file.size > 25 * 1024 * 1024) {
      return 'You may not upload files larger than 25MB.';
    }

    if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
      const extension = file.name.split('.').pop()?.toUpperCase() || 'unknown';
      return `Files of the following format is not supported: ${extension}`;
    }

    return null;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      setValidationError(null);

      const files = Array.from(e.dataTransfer.files);
      const file = files[0]; // Take the first file

      if (file) {
        const error = validateFile(file);
        if (error) {
          setValidationError(error);
          onError?.(error);
        } else {
          setSelectedFile(file);
        }
      } else {
        onError?.('Please select a PDF file');
      }
    },
    [onError]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setValidationError(null);
        const error = validateFile(file);
        if (error) {
          setValidationError(error);
          onError?.(error);
        } else {
          setSelectedFile(file);
        }
      } else {
        onError?.('Please select a PDF file');
      }
    },
    [onError]
  );

  const processPDF = useCallback(async () => {
    if (!selectedFile || !session) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingResult(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', documentType);

      const response = await fetch('/api/pdf/process', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProcessingProgress(100);

      const data = await response.json();

      if (response.ok && data.success) {
        setProcessingResult(data.result);
        setUsageStats(data.usage);
        onProcessingComplete?.(data.result);
      } else {
        onError?.(data.error || 'Failed to process PDF');
      }
    } catch (error) {
      onError?.(
        error instanceof Error ? error.message : 'Failed to process PDF'
      );
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  }, [selectedFile, documentType, session, onProcessingComplete, onError]);

  const resetUploader = useCallback(() => {
    setSelectedFile(null);
    setProcessingResult(null);
    setProcessingProgress(0);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  if (!session) {
    return (
      <div
        className={`p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}
      >
        <div className='text-gray-500'>
          Please sign in to upload and process PDFs
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Usage Stats */}
      {usageStats && (
        <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
          <div className='flex items-center justify-between'>
            <div className='text-sm text-green-800'>
              <span className='font-medium'>Daily PDF Processing:</span>{' '}
              {usageStats.used}/{usageStats.dailyLimit}
            </div>
            <div className='text-xs text-green-600'>
              Resets at {new Date(usageStats.resetTime).toLocaleTimeString()}
            </div>
          </div>
          <div className='mt-2 w-full bg-green-200 rounded-full h-2'>
            <div
              className='bg-green-600 h-2 rounded-full transition-all duration-300'
              style={{
                width: `${(usageStats.used / usageStats.dailyLimit) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Validation Error */}
      {validationError && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-4'>
          <div className='flex items-start space-x-3'>
            <div className='w-5 h-5 text-red-600 mt-0.5'>
              <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div>
              <p className='text-sm text-red-800 font-medium'>Upload Error</p>
              <p className='text-sm text-red-700 mt-1'>{validationError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {!selectedFile && !isProcessing && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className='space-y-4'>
            <div className='mx-auto w-12 h-12 text-gray-400'>
              <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                />
              </svg>
            </div>
            <div>
              <p className='text-lg font-medium text-gray-900'>
                Upload a PDF for AI Analysis
              </p>
              <p className='text-sm text-gray-500 mt-1'>
                Drag and drop your PDF here, or click to browse
              </p>
              <p className='text-xs text-gray-400 mt-2'>
                Maximum file size: 25MB • Up to 100 pages
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
            >
              Choose PDF File
            </button>
            <input
              ref={fileInputRef}
              type='file'
              accept='.pdf,application/pdf'
              onChange={handleFileSelect}
              className='hidden'
            />
          </div>
        </div>
      )}

      {/* File Selected */}
      {selectedFile && !isProcessing && (
        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center'>
                <svg
                  className='w-6 h-6 text-red-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z'
                  />
                </svg>
              </div>
              <div>
                <p className='font-medium text-gray-900'>{selectedFile.name}</p>
                <p className='text-sm text-gray-500'>
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={resetUploader}
              className='text-gray-400 hover:text-gray-600'
            >
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          {/* Document Type Selection */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Document Type (optional)
            </label>
            <select
              value={documentType}
              onChange={e => setDocumentType(e.target.value)}
              className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500'
            >
              <option value='general'>General Document</option>
              <option value='grant_proposal'>Grant Proposal</option>
              <option value='annual_report'>Annual Report</option>
              <option value='strategic_plan'>Strategic Plan</option>
              <option value='budget'>Budget Document</option>
              <option value='policy'>Policy Document</option>
              <option value='contract'>Contract/Agreement</option>
            </select>
          </div>

          <button
            onClick={processPDF}
            disabled={usageStats?.remaining === 0}
            className='w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed'
          >
            {usageStats?.remaining === 0
              ? 'Daily Limit Reached'
              : 'Process PDF'}
          </button>
        </div>
      )}

      {/* Processing */}
      {isProcessing && (
        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <div className='text-center space-y-4'>
            <div className='mx-auto w-12 h-12 text-green-600'>
              <svg
                className='animate-spin'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                />
              </svg>
            </div>
            <div>
              <p className='text-lg font-medium text-gray-900'>
                Processing PDF...
              </p>
              <p className='text-sm text-gray-500'>
                Extracting text and analyzing content
              </p>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-green-600 h-2 rounded-full transition-all duration-300'
                style={{ width: `${processingProgress}%` }}
              />
            </div>
            <p className='text-xs text-gray-400'>
              {processingProgress}% complete
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {processingResult && (
        <div className='bg-white border border-gray-200 rounded-lg p-6 space-y-6'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-medium text-gray-900'>
              Analysis Results
            </h3>
            <button
              onClick={resetUploader}
              className='text-sm text-green-600 hover:text-green-700'
            >
              Process Another PDF
            </button>
          </div>

          {/* Summary */}
          <div>
            <h4 className='font-medium text-gray-900 mb-2'>Summary</h4>
            <p className='text-gray-700'>{processingResult.summary}</p>
          </div>

          {/* Key Points */}
          {processingResult.keyPoints.length > 0 && (
            <div>
              <h4 className='font-medium text-gray-900 mb-2'>Key Points</h4>
              <ul className='space-y-1'>
                {processingResult.keyPoints.map((point, index) => (
                  <li key={index} className='flex items-start space-x-2'>
                    <span className='text-green-600 mt-1'>•</span>
                    <span className='text-gray-700'>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {processingResult.recommendations.length > 0 && (
            <div>
              <h4 className='font-medium text-gray-900 mb-2'>
                Recommendations
              </h4>
              <ul className='space-y-1'>
                {processingResult.recommendations.map((rec, index) => (
                  <li key={index} className='flex items-start space-x-2'>
                    <span className='text-blue-600 mt-1'>→</span>
                    <span className='text-gray-700'>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Metadata */}
          <div className='border-t pt-4'>
            <div className='grid grid-cols-2 gap-4 text-sm text-gray-500'>
              <div>
                <span className='font-medium'>Document Type:</span>{' '}
                {processingResult.documentType}
              </div>
              <div>
                <span className='font-medium'>Pages:</span>{' '}
                {processingResult.pageCount}
              </div>
              <div>
                <span className='font-medium'>Processing Time:</span>{' '}
                {(processingResult.processingTime / 1000).toFixed(1)}s
              </div>
              <div>
                <span className='font-medium'>AI Model:</span>{' '}
                {processingResult.model}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
