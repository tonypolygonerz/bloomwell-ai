"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage(): React.ReactElement {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError("")

    // TODO: Implement authentication once NextAuth is restored
    // For now, redirect to dashboard
    if (process.env.NODE_ENV === "development") {
      console.log("Login attempt:", { email, password })
    }
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border p-2"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border p-2"
          required
        />

        {error && <p className="text-red-500">{error}</p>}

        <button type="submit" className="w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-600">
          Login
        </button>
      </form>
    </div>
  )
}
