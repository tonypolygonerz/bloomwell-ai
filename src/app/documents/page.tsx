'use client';

import PDFUploader from '@/features/admin/components/PDFUploader';

export default function DocumentsPage() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>
            AI Document Analysis
          </h1>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Upload your PDF documents and get instant AI-powered insights,
            summaries, and recommendations tailored for nonprofit organizations.
          </p>
        </div>

        {/* Features Grid */}
        <div className='grid md:grid-cols-3 gap-6 mb-8'>
          <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
            <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4'>
              <svg
                className='w-6 h-6 text-green-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Smart Text Extraction
            </h3>
            <p className='text-gray-600 text-sm'>
              Advanced PDF parsing extracts text from complex documents,
              including tables and formatted content.
            </p>
          </div>

          <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
            <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4'>
              <svg
                className='w-6 h-6 text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
                />
              </svg>
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Nonprofit-Focused Analysis
            </h3>
            <p className='text-gray-600 text-sm'>
              AI analysis specifically tuned for nonprofit documents,
              identifying grant opportunities and compliance requirements.
            </p>
          </div>

          <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
            <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4'>
              <svg
                className='w-6 h-6 text-purple-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 10V3L4 14h7v7l9-11h-7z'
                />
              </svg>
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Instant Results
            </h3>
            <p className='text-gray-600 text-sm'>
              Get comprehensive analysis in seconds with actionable
              recommendations and key insights.
            </p>
          </div>
        </div>

        {/* Usage Information */}
        <div className='bg-green-50 border border-green-200 rounded-lg p-6 mb-8'>
          <div className='flex items-start space-x-3'>
            <div className='w-6 h-6 text-green-600 mt-0.5'>
              <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div>
              <h3 className='text-lg font-medium text-green-900 mb-2'>
                Free PDF Processing Included
              </h3>
              <p className='text-green-800 text-sm mb-3'>
                All Bloomwell AI subscribers get 5 PDF analyses per day at no
                additional cost. Perfect for processing grant proposals, annual
                reports, strategic plans, and more.
              </p>
              <ul className='text-green-800 text-sm space-y-1'>
                <li>• Up to 25MB file size per PDF</li>
                <li>• Up to 100 pages per document</li>
                <li>• Local processing for privacy and speed</li>
                <li>• No external API costs</li>
              </ul>
            </div>
          </div>
        </div>

        {/* PDF Uploader */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
          <div className='p-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-6'>
              Upload Your Document
            </h2>
            <PDFUploader
              onProcessingComplete={result => {
                console.log('PDF processing completed:', result);
              }}
              onError={error => {
                console.error('PDF processing error:', error);
              }}
            />
          </div>
        </div>

        {/* Document Types */}
        <div className='mt-8'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>
            Supported Document Types
          </h2>
          <div className='grid md:grid-cols-2 gap-4'>
            <div className='bg-white p-4 rounded-lg border border-gray-200'>
              <h3 className='font-medium text-gray-900 mb-2'>
                Grant Documents
              </h3>
              <ul className='text-sm text-gray-600 space-y-1'>
                <li>• Grant proposals and applications</li>
                <li>• RFP (Request for Proposal) documents</li>
                <li>• Grant guidelines and requirements</li>
                <li>• Award letters and contracts</li>
              </ul>
            </div>
            <div className='bg-white p-4 rounded-lg border border-gray-200'>
              <h3 className='font-medium text-gray-900 mb-2'>
                Organizational Documents
              </h3>
              <ul className='text-sm text-gray-600 space-y-1'>
                <li>• Annual reports and financial statements</li>
                <li>• Strategic plans and mission statements</li>
                <li>• Board meeting minutes and policies</li>
                <li>• Program evaluations and assessments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
