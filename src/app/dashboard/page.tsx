"use client"

import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useEffect } from "react"

export default function DashboardPage(): React.ReactElement {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/login")
    }
  }, [session, status, router])

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  if (!session) {
    return <div className="flex min-h-screen items-center justify-center">Redirecting...</div>
  }

  const handleLogout = async (): Promise<void> => {
    await signOut({ callbackUrl: "/auth/login" })
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
          <p className="mb-4 text-gray-600">Welcome, {session.user?.email}!</p>
          <p className="text-gray-600">You have successfully authenticated. This is your protected dashboard.</p>
        </div>
      </div>
    </div>
  )
}
