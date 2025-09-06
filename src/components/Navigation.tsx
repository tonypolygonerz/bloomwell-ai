'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { LogoutButton } from './LogoutButton'

export function Navigation() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return null
  }

  if (status === 'unauthenticated') {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Nonprofit AI Assistant
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/login" 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/register" 
                className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              Nonprofit AI Assistant
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link 
                href="/dashboard" 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link 
                href="/chat" 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                AI Chat
              </Link>
              <Link 
                href="/profile" 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Profile
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Welcome, {session?.user?.name || session?.user?.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
