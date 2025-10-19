'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminBreadcrumb from '@/components/AdminBreadcrumb'

export default function CreateWebinar() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    timezone: 'America/Los_Angeles',
    duration: 60,
    thumbnailUrl: '',
    status: 'draft'
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const adminSession = localStorage.getItem('adminSession')
      if (!adminSession) {
        router.push('/admin/login')
        return
      }

      // Upload file first if one is selected
      let thumbnailUrl = formData.thumbnailUrl
      if (selectedFile) {
        const uploadedUrl = await uploadFile()
        if (uploadedUrl) {
          thumbnailUrl = uploadedUrl
        } else {
          setLoading(false)
          return // Error already set by uploadFile
        }
      }

      const sessionData = JSON.parse(adminSession)
      const response = await fetch('/api/admin/webinars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.token}`
        },
        body: JSON.stringify({
          ...formData,
          thumbnailUrl
        }),
      })

      if (response.ok) {
        const webinar = await response.json()
        router.push(`/admin/webinars/${webinar.id}/edit`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create webinar')
      }
    } catch (error) {
      setError('An error occurred while creating the webinar')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) : value
    }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  const validateAndSetFile = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPG, PNG, and GIF files are allowed.')
      return
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB.')
      return
    }

    setError('')
    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setFilePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const uploadFile = async (): Promise<string | null> => {
    if (!selectedFile) return null

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const adminSession = localStorage.getItem('adminSession')
      if (!adminSession) {
        throw new Error('Admin session not found')
      }

      const sessionData = JSON.parse(adminSession)
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      return result.fileUrl
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
      return null
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
    setFormData(prev => ({ ...prev, thumbnailUrl: '' }))
  }

  useEffect(() => {
    // Check for admin session
    const adminSession = localStorage.getItem('adminSession')
    if (!adminSession) {
      router.push('/admin/login')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <AdminBreadcrumb
              items={[
                { label: 'Webinars', href: '/admin' },
                { label: 'Create New' }
              ]}
            />
          </div>
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Webinar</h1>
              <p className="mt-1 text-sm text-gray-500">
                Set up a new webinar event for your nonprofit community
              </p>
            </div>
            <Link
              href="/admin"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Back to Admin
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow sm:rounded-lg">
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Webinar Title *
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter webinar title"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Describe what this webinar will cover"
                />
              </div>

              {/* Scheduled Date */}
              <div>
                <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700">
                  Scheduled Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="scheduledDate"
                  id="scheduledDate"
                  required
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {/* Timezone */}
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                  Timezone *
                </label>
                <select
                  name="timezone"
                  id="timezone"
                  required
                  value={formData.timezone}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  name="duration"
                  id="duration"
                  min="15"
                  max="240"
                  required
                  value={formData.duration}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail Image
                </label>
                
                {!selectedFile ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-400 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept=".jpg,.jpeg,.png,.gif"
                            onChange={handleFileSelect}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1">
                    <div className="flex items-center space-x-4 p-4 border border-gray-300 rounded-md bg-gray-50">
                      {filePreview && (
                        <div className="flex-shrink-0">
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="h-20 w-32 object-cover rounded-md"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex space-x-2">
                        <button
                          type="button"
                          onClick={removeFile}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  id="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Link
                href="/admin"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || uploading}
                className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : loading ? 'Creating...' : 'Create Webinar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
