'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useHybridChat } from '../../../hooks/useHybridChat';
import OnlinePermissionModal from '../../../components/OnlinePermissionModal';
import AIModelBadge from '../../../components/AIModelBadge';
import AppLayout from '@/shared/components/layout/AppLayout';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date | string;
  createdAt?: Date | string;
  // Cloud AI tracking fields
  aiModel?: string;
  modelTier?: string;
  processingTime?: number;
  tokenEstimate?: number;
  queryType?: string;
  contextLength?: number;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export default function ChatConversationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showConversationsSidebar, setShowConversationsSidebar] =
    useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hybrid chat functionality
  const { sendMessage: sendHybridMessage } = useHybridChat();
  const [showOnlinePermission, setShowOnlinePermission] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('');
  const [pendingConversationHistory, setPendingConversationHistory] = useState<
    any[]
  >([]);

  // Generate unique ID for client-side only
  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Load conversation and conversations on mount
  useEffect(() => {
    if (session?.user && conversationId) {
      loadConversation(conversationId);
      loadConversations();
    }
  }, [session, conversationId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`);
      if (response.ok) {
        const data = await response.json();
        setConversation(data.conversation);
        setMessages(data.conversation.messages || []);
      } else if (response.status === 404) {
        // Conversation not found, redirect to main chat
        router.push('/chat');
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      setError('Failed to load conversation');
    }
  };

  const deleteConversation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/chat');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handlePromptSelect = async (prompt: string) => {
    if (!prompt.trim() || isLoading || !conversationId) return;

    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content: prompt.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError('');

    try {
      const data = await sendHybridMessage(
        userMessage.content,
        conversationId,
        messages.slice(-10)
      );

      const assistantMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        aiModel: data.aiModel,
        modelTier: data.modelTier,
        processingTime: data.processingTime,
        tokenEstimate: data.tokenEstimate,
        queryType: data.queryType,
        contextLength: data.contextLength,
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.suggestOnline && data.responseType === 'suggestion') {
        setPendingMessage(userMessage.content);
        setPendingConversationHistory(messages.slice(-10));
        setShowOnlinePermission(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');

      const errorMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content:
          "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !conversationId) return;

    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError('');

    try {
      // Use hybrid chat system
      const data = await sendHybridMessage(
        userMessage.content,
        conversationId,
        messages.slice(-10)
      );

      const assistantMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        aiModel: data.aiModel,
        modelTier: data.modelTier,
        processingTime: data.processingTime,
        tokenEstimate: data.tokenEstimate,
        queryType: data.queryType,
        contextLength: data.contextLength,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If the system suggests online access, show permission modal
      if (data.suggestOnline && data.responseType === 'suggestion') {
        setPendingMessage(userMessage.content);
        setPendingConversationHistory(messages.slice(-10));
        setShowOnlinePermission(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');

      const errorMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content:
          "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnlinePermissionApprove = async () => {
    if (!conversationId || !pendingMessage) return;

    setShowOnlinePermission(false);
    setIsLoading(true);

    try {
      const data = await sendHybridMessage(
        pendingMessage,
        conversationId,
        pendingConversationHistory,
        true // useOnline = true
      );

      const assistantMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Online chat error:', error);
      setError('Sorry, I encountered an error accessing online information.');
    } finally {
      setIsLoading(false);
      setPendingMessage('');
      setPendingConversationHistory([]);
    }
  };

  const handleOnlinePermissionDecline = () => {
    setShowOnlinePermission(false);
    setPendingMessage('');
    setPendingConversationHistory([]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  if (status === 'loading') {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <AppLayout initialCollapsed={true}>
      <div className='h-[calc(100vh-8rem)] flex gap-4'>
        {/* Conversations Sidebar */}
        <div
          className={`${showConversationsSidebar ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden shadow-sm`}
        >
          <div className='p-4 border-b border-gray-200'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Conversations
              </h2>
              <button
                onClick={() => router.push('/chat')}
                className='p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors'
                title='New conversation'
              >
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 4v16m8-8H4'
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className='flex-1 overflow-y-auto'>
            <div className='px-2'>
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`group relative p-3 rounded-lg transition-colors cursor-pointer ${
                    conv.id === conversationId
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => router.push(`/chat/${conv.id}`)}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-sm font-medium truncate'>
                        {conv.title || 'Untitled Conversation'}
                      </h3>
                      <p className='text-xs text-gray-500 mt-1'>
                        {formatDate(conv.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className='opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all'
                    >
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className='flex-1 flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden'>
          {/* Chat Header */}
          <div className='border-b border-gray-200 px-6 py-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-xl font-semibold text-gray-900'>
                  {conversation?.title || 'Chat Conversation'}
                </h1>
                <p className='text-sm text-gray-600'>
                  Continue your conversation with Bloomwell AI
                </p>
              </div>
              <div className='flex items-center space-x-3'>
                <button
                  onClick={() => router.push('/chat')}
                  className='text-green-600 hover:text-green-700 font-medium transition-colors'
                >
                  New Chat
                </button>
                <button
                  onClick={() =>
                    setShowConversationsSidebar(!showConversationsSidebar)
                  }
                  className='p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
                  title='Toggle conversations'
                >
                  <svg
                    className='w-5 h-5'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <rect
                      x='3'
                      y='4'
                      width='18'
                      height='16'
                      rx='2'
                      ry='2'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                    />
                    <rect
                      x='5'
                      y='6'
                      width='6'
                      height='12'
                      rx='1'
                      ry='1'
                      fill='currentColor'
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className='flex-1 overflow-y-auto px-6 py-4'>
            <div className='max-w-4xl mx-auto space-y-4'>
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl px-4 py-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-50 border border-gray-200 text-gray-900'
                    }`}
                  >
                    <div className='whitespace-pre-wrap'>{message.content}</div>
                    <div className='flex items-center justify-between mt-2'>
                      <div
                        className={`text-xs ${
                          message.role === 'user'
                            ? 'text-purple-100'
                            : 'text-gray-500'
                        }`}
                        suppressHydrationWarning={true}
                      >
                        {message.timestamp || message.createdAt
                          ? formatTime(
                              new Date(message.timestamp || message.createdAt!)
                            )
                          : 'Just now'}
                      </div>
                      {message.role === 'assistant' && (
                        <AIModelBadge
                          modelTier={message.modelTier}
                          modelDescription={message.aiModel}
                          processingTime={message.processingTime}
                          contextLength={message.contextLength}
                          queryType={message.queryType}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {messages.length === 0 && !isLoading && (
                <div className='flex flex-col justify-center items-center h-full min-h-[500px]'>
                  <div className='text-gray-500 text-center'>
                    <p className='text-lg mb-2'>Loading conversation...</p>
                    <p className='text-sm'>
                      Please wait while we retrieve your messages.
                    </p>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className='flex justify-start'>
                  <div className='bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg'>
                    <div className='flex items-center space-x-2'>
                      <div className='animate-pulse flex space-x-1'>
                        <div className='w-2 h-2 bg-purple-400 rounded-full animate-bounce'></div>
                        <div
                          className='w-2 h-2 bg-purple-400 rounded-full animate-bounce'
                          style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                          className='w-2 h-2 bg-purple-400 rounded-full animate-bounce'
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                      </div>
                      <span className='text-gray-500 text-sm'>
                        Connecting to Ollama Cloud AI...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className='px-6 py-2'>
              <div className='max-w-4xl mx-auto'>
                <div className='bg-red-50 border border-red-200 rounded-md p-3'>
                  <div className='flex'>
                    <div className='flex-shrink-0'>
                      <svg
                        className='h-5 w-5 text-red-400'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </div>
                    <div className='ml-3'>
                      <p className='text-sm text-red-800'>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className='border-t border-gray-200 px-6 py-4'>
            <div className='max-w-4xl mx-auto'>
              <form onSubmit={handleSubmit} className='flex space-x-4'>
                <div className='flex-1'>
                  <input
                    type='text'
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder='Type your message...'
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    disabled={isLoading}
                  />
                </div>
                <button
                  type='submit'
                  disabled={!inputValue.trim() || isLoading}
                  className='px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  {isLoading ? (
                    <div className='flex items-center'>
                      <svg
                        className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        ></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                      </svg>
                      Sending...
                    </div>
                  ) : (
                    'Send'
                  )}
                </button>
              </form>
            </div>
          </div>
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
    </AppLayout>
  );
}
