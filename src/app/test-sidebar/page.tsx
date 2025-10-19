import AppLayout from '@/shared/components/layout/AppLayout';

export default function TestSidebarPage() {
  return (
    <AppLayout>
      <div className='max-w-4xl'>
        <h1 className='text-3xl font-bold text-gray-900 mb-4'>
          Sidebar Test Page
        </h1>
        <p className='text-gray-600 mb-4'>
          This page is for testing the basic sidebar structure.
        </p>

        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-3'>
            Verification Checklist:
          </h2>
          <ul className='space-y-2 text-gray-700'>
            <li>✓ Sidebar appears on left (desktop only)</li>
            <li>✓ Fixed width: 240px (w-60)</li>
            <li>✓ Logo at top with green gradient circle</li>
            <li>✓ &quot;Bloomwell AI&quot; text next to logo</li>
            <li>✓ 7 navigation items visible</li>
            <li>✓ Icons and labels aligned properly</li>
            <li>✓ Hover effects on nav items (should turn gray)</li>
            <li>✓ Right border on sidebar</li>
            <li>✓ Sidebar hidden on mobile (resize to check)</li>
          </ul>
        </div>

        <div className='mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-6'>
          <h3 className='font-semibold text-emerald-900 mb-2'>
            Next Steps (Phase 2):
          </h3>
          <ul className='text-emerald-800 space-y-1 text-sm'>
            <li>• Add trial status banner at bottom</li>
            <li>• Add top navigation bar</li>
            <li>• Make sidebar collapsible</li>
            <li>• Add user profile section</li>
            <li>• Add mobile drawer functionality</li>
          </ul>
        </div>

        {/* Scroll test content */}
        <div className='mt-6 h-screen bg-blue-100 p-6 rounded-lg'>
          <h3 className='text-lg font-semibold text-blue-900 mb-4'>
            Scroll Test Area
          </h3>
          <p className='text-blue-800 mb-4'>
            This content should be scrollable. The main content area should have
            proper overflow handling.
          </p>
          <div className='space-y-4'>
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className='bg-blue-200 p-4 rounded'>
                <p className='text-blue-900'>
                  Scroll test item {i + 1} - Content should be scrollable within
                  the main area
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
