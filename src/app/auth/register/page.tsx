"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function RegisterPage(): React.ReactElement {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError("")

    // TODO: Implement user registration
    console.log("Registration attempt:", { email, password, name })
    router.push("/auth/login")
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Register</h1>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border p-2"
          required
        />

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

        <button type="submit" className="w-full rounded bg-green-500 p-2 text-white hover:bg-green-600">
          Register
        </button>
      </form>
    </div>
  )
}
