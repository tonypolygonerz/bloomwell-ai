"use client"

import { useRouter } from "next/navigation"

export default function DashboardPage(): React.ReactElement {
  const router = useRouter()

  const handleLogout = (): void => {
    // TODO: Implement logout once NextAuth is restored
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button onClick={handleLogout} className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">
            Logout
          </button>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Welcome to Bloomwell AI</h2>
          <p className="mb-4 text-gray-600">Welcome, Guest!</p>
          <p className="text-gray-600">
            This is your dashboard. Authentication is temporarily disabled while NextAuth is being configured.
          </p>
        </div>
      </div>
    </div>
  )
}
