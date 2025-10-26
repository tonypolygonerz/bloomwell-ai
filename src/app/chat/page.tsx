'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

export default function ChatPage(): React.ReactElement {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Array<{id: string, content: string, role: 'user' | 'assistant'}>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    router.push('/auth/login')
    return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { id: Date.now().toString(), content: input, role: 'user' as const }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json() as { response: string }
      const assistantMessage = { 
        id: (Date.now() + 1).toString(), 
        content: data.response, 
        role: 'assistant' as const 
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = { 
        id: (Date.now() + 1).toString(), 
        content: 'Sorry, I encountered an error. Please try again.', 
        role: 'assistant' as const 
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Nonprofit AI Assistant</h1>
        
        <div className="bg-white rounded-lg shadow p-4 mb-4 h-96 overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-gray-500 text-center py-8">
              Ask me anything about nonprofit management, grants, or fundraising!
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-2 rounded-lg max-w-xs ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}>
                {message.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="text-left mb-4">
              <div className="inline-block p-2 rounded-lg bg-gray-200 text-gray-800">
                Thinking...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about grants, fundraising, board management..."
            className="flex-1 p-2 border rounded-lg"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
