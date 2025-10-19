// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';

interface PDFUploaderProps {
  onUpload: (file: File) => void;
  loading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: string | null | any;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({
  onUpload,
  loading,
  error,
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      setSelectedFile(e.dataTransfer.files[0]);
      onUpload(e.dataTransfer.files[0]);
    },
    [onUpload]
  );

  const handleFileSelect = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        onUpload(file);
      }
    },
    [onUpload]
  );

  return (
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
          onClick={() => {
            // This button is for demonstration purposes.
            // In a real application, you would use a file input.
            // For now, it will trigger the onUpload prop.
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.pdf,application/pdf';
            fileInput.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                onUpload(file);
              }
            };
            fileInput.click();
          }}
          className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
        >
          Choose PDF File
        </button>
        <input
          type='file'
          accept='.pdf,application/pdf'
          onChange={handleFileSelect}
          className='hidden'
        />
      </div>
    </div>
  );
};

export default PDFUploader;
