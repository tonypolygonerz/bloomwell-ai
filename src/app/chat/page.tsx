"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState } from "react"

// Prevent static generation to avoid useSession() errors during build
export const dynamic = "force-dynamic"

export default function ChatPage(): React.ReactElement {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Array<{ id: string; content: string; role: "user" | "assistant" }>>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  if (!session) {
    router.push("/auth/login")
    return <div className="flex min-h-screen items-center justify-center">Redirecting...</div>
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { id: Date.now().toString(), content: input, role: "user" as const }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = (await response.json()) as { response: string }
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: "assistant" as const,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      // Log error for debugging in development only
      if (process.env.NODE_ENV === "development") {
        console.error("Chat error:", error)
      }
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        role: "assistant" as const,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold">Nonprofit AI Assistant</h1>

        <div className="mb-4 h-96 overflow-y-auto rounded-lg bg-white p-4 shadow">
          {messages.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              Ask me anything about nonprofit management, grants, or fundraising!
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}>
              <div
                className={`inline-block max-w-xs rounded-lg p-2 ${
                  message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="mb-4 text-left">
              <div className="inline-block rounded-lg bg-gray-200 p-2 text-gray-800">Thinking...</div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about grants, fundraising, board management..."
            className="flex-1 rounded-lg border p-2"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-300"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
