'use client'

import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useEffect } from 'react'

export default function DashboardPage(): React.ReactElement {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/login')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>
  }

  const handleLogout = async (): Promise<void> => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Welcome to Bloomwell AI</h2>
          <p className="text-gray-600 mb-4">
            Welcome, {session.user?.email}!
          </p>
          <p className="text-gray-600">
            You have successfully authenticated. This is your protected dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}
