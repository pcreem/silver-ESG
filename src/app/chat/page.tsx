'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui'
import { Avatar } from '@/components/ui/Avatar'
import { motion } from 'framer-motion'
import { Send, Bot, User, Sparkles, Loader2, AlertCircle, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface QuickQuestion {
  text: string
  icon: string
}

const quickQuestions: QuickQuestion[] = [
  { text: '今天有什麼推薦的餐點？', icon: '🍽️' },
  { text: '我想預約明天的配送', icon: '📅' },
  { text: '我的營養攝取狀況如何？', icon: '📊' },
  { text: '有哪些適合糖尿病的餐點？', icon: '🍬' },
]

const initialMessages: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: '您好！我是銀髮族送餐的 AI 營養顧問，很高興為您服務。請問有什麼可以幫助您的嗎？',
    timestamp: new Date(),
  },
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
        }
      } catch (err) {
        console.error('Error checking auth:', err)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setError(null)
    setIsTyping(true)

    // Create placeholder AI message for streaming
    const aiMessageId = (Date.now() + 1).toString()
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, aiMessage])

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('請先登入以使用聊天功能')
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('登入已過期，請重新登入')
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || '發生錯誤，請稍後再試')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('響應讀取器錯誤')
      }

      const decoder = new TextDecoder()
      let aiContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        aiContent += chunk

        // Update the AI message with streamed content
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, content: aiContent }
              : msg
          )
        )
      }
    } catch (err: any) {
      console.error('Chat error:', err)

      // Remove the empty AI message
      setMessages((prev) => prev.filter((msg) => msg.id !== aiMessageId))

      // Show error message
      const errorMessage = err.message || '抱歉，系統發生錯誤，請稍後再試'
      setError(errorMessage)

      // Add error response from assistant
      const errorResponse: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `抱歉，${errorMessage}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }, [inputValue, isTyping])

  const handleQuickQuestion = (question: string) => {
    setInputValue(question)
    // Focus the input
    const input = document.querySelector('input[type="text"]') as HTMLInputElement
    input?.focus()
  }

  const handleLogin = () => {
    router.push('/login')
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="page-container h-[calc(100vh-6rem)] flex flex-col">
        <h1 className="section-title">AI 營養顧問</h1>
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              <span className="text-neutral-500">載入中...</span>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="page-container h-[calc(100vh-6rem)] flex flex-col"
      >
        <h1 className="section-title">AI 營養顧問</h1>

        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <LogIn className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">需要登入</h3>
            <p className="text-neutral-500 mb-6 max-w-sm">
              請先登入以使用 AI 營養顧問功能，我們會根據您的健康資料提供個人化建議。
            </p>
            <Button onClick={handleLogin} size="lg">
              前往登入
            </Button>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="page-container h-[calc(100vh-6rem)] flex flex-col"
    >
      <h1 className="section-title">AI 營養顧問</h1>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-neutral-100 bg-neutral-50">
          <div className="flex items-center space-x-3">
            <Avatar fallback={<Bot className="w-6 h-6" />} size="md" status="online" />
            <div>
              <h3 className="font-medium text-neutral-800">AI 營養顧問</h3>
              <p className="text-xs text-neutral-500 flex items-center">
                <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
                AI 智能對話中
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex items-start space-x-3',
                message.role === 'user' && 'flex-row-reverse space-x-reverse'
              )}
            >
              <Avatar
                fallback={message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                size="sm"
                className={message.role === 'user' ? 'bg-primary-500' : 'bg-secondary-500'}
              />
              <div className={cn(
                'max-w-[70%] rounded-2xl px-4 py-3',
                message.role === 'user'
                  ? 'bg-primary-500 text-white rounded-br-md'
                  : 'bg-neutral-100 text-neutral-800 rounded-bl-md'
              )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={cn('text-xs mt-1', message.role === 'user' ? 'text-primary-200' : 'text-neutral-400')}>
                  {formatRelativeTime(message.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <div className="flex items-center space-x-3">
              <Avatar fallback={<Bot className="w-5 h-5" />} size="sm" className="bg-secondary-500" />
              <div className="bg-neutral-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center space-x-1">
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                  <span className="text-sm text-neutral-500">正在思考...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-600">{error}</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50">
            <p className="text-xs text-neutral-500 mb-2">快捷問題：</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(q.text)}
                  className="px-3 py-1.5 text-sm bg-white border border-neutral-200 rounded-full hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 transition-colors"
                >
                  <span className="mr-1">{q.icon}</span>
                  {q.text}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-neutral-100">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="輸入您的問題..."
              className="flex-1 px-4 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100"
              disabled={isTyping}
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
