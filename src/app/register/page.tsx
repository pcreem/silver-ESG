'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuthStore()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('密碼不一致')
      setLoading(false)
      return
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          },
        },
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (data.user) {
        // Store user info in auth store
        login({
          id: data.user.id,
          email: data.user.email || '',
          name: formData.name,
        })

        // Set API token
        if (data.session?.access_token) {
          api.setToken(data.session.access_token)
        }

        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || '註冊失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-600">銀髮族餐飲服務</h1>
          <p className="mt-2 text-gray-600">建立您的帳戶</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="姓名"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="請輸入您的姓名"
              required
            />

            <Input
              label="電子郵件"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="請輸入電子郵件"
              required
            />

            <Input
              label="密碼"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="請輸入密碼"
              required
            />

            <Input
              label="確認密碼"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="請再次輸入密碼"
              required
            />

            <Button type="submit" className="w-full" loading={loading}>
              註冊
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              已經有帳戶？{' '}
              <Link href="/login" className="text-primary-600 hover:text-primary-500 font-medium">
                立即登入
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
