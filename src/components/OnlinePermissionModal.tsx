'use client'

import { useState } from 'react'

interface OnlinePermissionModalProps {
  isOpen: boolean
  onClose: () => void
  onApprove: () => void
  onDecline: () => void
  message: string
}

export default function OnlinePermissionModal({
  isOpen,
  onClose,
  onApprove,
  onDecline,
  message
}: OnlinePermissionModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Online Access Request
            </h3>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">
            Your question: <span className="font-medium">"{message}"</span>
          </p>
          <p className="text-sm text-gray-600 mb-3">
            This type of question might benefit from current, up-to-date information from online sources.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>Privacy Note:</strong> Your nonprofit-specific conversations with Bloomwell AI remain completely local and private. Only general information queries (like weather, news, or current events) would access online sources.
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onApprove}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Allow Online Access
          </button>
          <button
            onClick={onDecline}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Use Local Knowledge
          </button>
        </div>
        
        <div className="mt-3 text-center">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
