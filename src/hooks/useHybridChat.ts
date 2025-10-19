import { useState, useCallback } from 'react'

interface HybridChatResponse {
  response: string
  responseType: 'local' | 'online' | 'suggestion'
  suggestOnline: boolean
  timestamp: string
}

interface UseHybridChatReturn {
  sendMessage: (message: string, conversationId: string, conversationHistory: any[], useOnline?: boolean) => Promise<HybridChatResponse>
  isOnlineRequested: boolean
  setOnlineRequested: (requested: boolean) => void
}

export function useHybridChat(): UseHybridChatReturn {
  const [isOnlineRequested, setIsOnlineRequested] = useState(false)

  const sendMessage = useCallback(async (
    message: string, 
    conversationId: string, 
    conversationHistory: any[], 
    useOnline: boolean = false
  ): Promise<HybridChatResponse> => {
    try {
      const response = await fetch('/api/chat-hybrid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory,
          conversationId,
          useOnline
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }, [])

  const setOnlineRequested = useCallback((requested: boolean) => {
    setIsOnlineRequested(requested)
  }, [])

  return {
    sendMessage,
    isOnlineRequested,
    setOnlineRequested
  }
}
