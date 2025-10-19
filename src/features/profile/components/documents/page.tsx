'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type DocumentType = {
  id: string;
  label: string;
  required: boolean;
};

type Document = {
  id: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  createdAt: string;
};

export default function ProfileDocumentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [availableTypes, setAvailableTypes] = useState<DocumentType[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/onboarding/sections/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
        setAvailableTypes(data.availableTypes || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    documentType: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadingType(documentType);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      formData.append('category', 'legal');

      const response = await fetch('/api/onboarding/sections/documents', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await loadDocuments();
        alert('Document uploaded successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
      setUploadingType(null);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(
        `/api/onboarding/sections/documents?id=${documentId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        await loadDocuments();
        alert('Document deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <button
            onClick={() => router.push('/dashboard')}
            className='text-emerald-600 hover:text-emerald-700 mb-4 flex items-center gap-2'
          >
            ← Back to Dashboard
          </button>
          <h1 className='text-3xl font-bold text-gray-900'>
            Important Documents
          </h1>
          <p className='mt-2 text-gray-600'>
            Upload key documents to help with grant applications
          </p>
        </div>

        {/* Info Box */}
        <div className='mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <p className='text-sm text-blue-800'>
            <strong>Tip:</strong> Having these documents ready makes it faster
            to apply for grants. You can upload them now or come back later.
          </p>
        </div>

        {/* Documents List */}
        <div className='space-y-4'>
          {availableTypes.map(type => {
            const hasDocument = documents.some(d => d.documentType === type.id);
            const document = documents.find(d => d.documentType === type.id);

            return (
              <div
                key={type.id}
                className='bg-white shadow-sm rounded-lg p-6 border border-gray-200'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <h3 className='font-semibold text-gray-900'>
                        {type.label}
                      </h3>
                      {type.required && (
                        <span className='px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded'>
                          Required
                        </span>
                      )}
                    </div>

                    {hasDocument && document ? (
                      <div className='space-y-2'>
                        <div className='flex items-center gap-3'>
                          <svg
                            className='w-5 h-5 text-emerald-600'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                            />
                          </svg>
                          <div className='flex-1'>
                            <p className='text-sm font-medium text-gray-900'>
                              {document.fileName}
                            </p>
                            <p className='text-xs text-gray-500'>
                              {formatFileSize(document.fileSize)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDelete(document.id)}
                            className='text-red-600 hover:text-red-700 text-sm'
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className='inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer transition-all'>
                        <svg
                          className='w-5 h-5 text-gray-400'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                          />
                        </svg>
                        <span className='text-sm font-medium text-gray-700'>
                          {uploading && uploadingType === type.id
                            ? 'Uploading...'
                            : 'Upload File'}
                        </span>
                        <input
                          type='file'
                          accept='.pdf,.doc,.docx'
                          onChange={e => handleFileUpload(e, type.id)}
                          className='hidden'
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className='mt-6 flex gap-4'>
          <button
            onClick={() => router.push('/dashboard')}
            className='flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
          >
            I&apos;ll Do This Later
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className='flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium'
          >
            Continue
          </button>
        </div>

        {/* Progress Indicator */}
        <div className='mt-6 text-center text-sm text-gray-500'>
          Section 6 of 8 • Important Documents
        </div>
      </div>
    </div>
  );
}
