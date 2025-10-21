'use client'

import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'

import OnlinePermissionModal from '../../../components/OnlinePermissionModal'
import { useHybridChat } from '../../../hooks/useHybridChat'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date | string
  createdAt?: Date | string
}

interface Conversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: Message[]
}

export default function ChatConversationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const conversationId = params.id as string
  
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [showSidebar, setShowSidebar] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Hybrid chat functionality
  const { sendMessage: sendHybridMessage } = useHybridChat()
  const [showOnlinePermission, setShowOnlinePermission] = useState(false)
  const [pendingMessage, setPendingMessage] = useState('')
  const [pendingConversationHistory, setPendingConversationHistory] = useState<any[]>([])

  // Generate unique ID for client-side only
  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Load conversation and conversations on mount
  useEffect(() => {
    if (session?.user && conversationId) {
      loadConversation(conversationId)
      loadConversations()
    }
  }, [session, conversationId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const loadConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`)
      if (response.ok) {
        const data = await response.json()
        setConversation(data.conversation)
        setMessages(data.conversation.messages || [])
      } else if (response.status === 404) {
        // Conversation not found, redirect to main chat
        router.push('/chat')
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
      setError('Failed to load conversation')
    }
  }

  const deleteConversation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return

    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/chat')
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading || !conversationId) return

    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setError('')

    try {
      // Use hybrid chat system
      const data = await sendHybridMessage(
        userMessage.content,
        conversationId,
        messages.slice(-10)
      )

      const assistantMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // If the system suggests online access, show permission modal
      if (data.suggestOnline && data.responseType === 'suggestion') {
        setPendingMessage(userMessage.content)
        setPendingConversationHistory(messages.slice(-10))
        setShowOnlinePermission(true)
      }

    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOnlinePermissionApprove = async () => {
    if (!conversationId || !pendingMessage) return

    setShowOnlinePermission(false)
    setIsLoading(true)

    try {
      const data = await sendHybridMessage(
        pendingMessage,
        conversationId,
        pendingConversationHistory,
        true // useOnline = true
      )

      const assistantMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Online chat error:', error)
      setError('Sorry, I encountered an error accessing online information.')
    } finally {
      setIsLoading(false)
      setPendingMessage('')
      setPendingConversationHistory([])
    }
  }

  const handleOnlinePermissionDecline = () => {
    setShowOnlinePermission(false)
    setPendingMessage('')
    setPendingConversationHistory([])
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <button
              onClick={() => router.push('/chat')}
              className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              New Conversation
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  conv.id === conversationId ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => router.push(`/chat/${conv.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {conv.title || 'Untitled Conversation'}
                    </h3>
                    <p className="text-xs text-gray-500" suppressHydrationWarning={true}>
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteConversation(conv.id)
                    }}
                    className="ml-2 p-1 text-gray-400 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!showSidebar && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <h1 className="text-xl font-semibold text-gray-900">
                {conversation?.title || 'Chat Conversation'}
              </h1>
            </div>
            <button
              onClick={() => router.push('/chat')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              New Chat
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                    suppressHydrationWarning={true}
                  >
                    {(message.timestamp || message.createdAt) ? new Date(message.timestamp || message.createdAt!).toLocaleTimeString() : 'Just now'}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mx-4 rounded-md">
            {error}
          </div>
        )}

        {/* Input Form */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Online Permission Modal */}
      <OnlinePermissionModal
        isOpen={showOnlinePermission}
        onClose={handleOnlinePermissionDecline}
        onApprove={handleOnlinePermissionApprove}
        onDecline={handleOnlinePermissionDecline}
        message={pendingMessage}
      />
    </div>
  )
}
