'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { motion } from 'framer-motion'
import { Trash2, Minus, Plus, CreditCard, Truck, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/auth-api'
import { api } from '@/lib/api'
import type { Profile } from '@/types'

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, total } = useCartStore()
  const { initialize } = useAuthStore()
  const [deliveryTime, setDeliveryTime] = useState('11:00')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 確保只在客戶端渲染後顯示金額，避免 hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize auth store and load profiles from backend on mount
  useEffect(() => {
    const initAndLoadProfiles = async () => {
      try {
        // 1. 初始化 auth store
        await initialize()

        // 2. 直接從 Supabase 取得最新 session，確保拿到最新 token
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.access_token) {
          // 沒有有效的 session，等待一小段時間後重試（解決 race condition）
          await new Promise(resolve => setTimeout(resolve, 500))
          const { data: { session: retrySession } } = await supabase.auth.getSession()
          
          if (!retrySession?.access_token) {
            return // 沒有登入，正常狀況
          }
          
          // 設定 token
          if (typeof window !== 'undefined') {
            localStorage.setItem('sb-access-token', retrySession.access_token)
          }
          api.setToken(retrySession.access_token)
          
          // 載入長輩資料
          setLoadingProfiles(true)
          try {
            const profileList = await api.getProfiles()
            setProfiles(profileList)
            if (profileList.length > 0 && !selectedProfile) {
              setSelectedProfile(profileList[0])
            }
          } catch (error) {
            console.error('Failed to fetch profiles:', error)
          } finally {
            setLoadingProfiles(false)
          }
          return
        }

        // 3. 使用 Supabase session 的 token
        api.setToken(session.access_token)
        
        // 4. 載入長輩資料
        setLoadingProfiles(true)
        try {
          const profileList = await api.getProfiles()
          setProfiles(profileList)
          // Auto-select first profile if available
          if (profileList.length > 0 && !selectedProfile) {
            setSelectedProfile(profileList[0])
          }
        } catch (error) {
          console.error('Failed to fetch profiles:', error)
        } finally {
          setLoadingProfiles(false)
        }
      } catch (error) {
        console.error('Failed to initialize and load profiles:', error)
      }
    }

    initAndLoadProfiles()

    // 監聽 auth 狀態變化，重新載入 profiles
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.access_token) {
          // 登入成功，重新載入
          api.setToken(session.access_token)
          if (typeof window !== 'undefined') {
            localStorage.setItem('sb-access-token', session.access_token)
          }
          setLoadingProfiles(true)
          try {
            const profileList = await api.getProfiles()
            setProfiles(profileList)
            if (profileList.length > 0 && !selectedProfile) {
              setSelectedProfile(profileList[0])
            }
          } catch (error) {
            console.error('Failed to fetch profiles after sign in:', error)
          } finally {
            setLoadingProfiles(false)
          }
        } else if (event === 'SIGNED_OUT') {
          // 登出，清空
          setProfiles([])
          setSelectedProfile(null)
        } else if (event === 'TOKEN_REFRESHED' && session?.access_token) {
          // Token 刷新，更新 API token
          api.setToken(session.access_token)
          if (typeof window !== 'undefined') {
            localStorage.setItem('sb-access-token', session.access_token)
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [initialize])

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = subtotal >= 500 ? 0 : 50
  const cartTotal = total()


  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('購物車是空的')
      return
    }

    if (!selectedProfile) {
      toast.error('請選擇配送對象')
      return
    }

    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      toast.error('請先登入才能付款')
      window.location.href = '/login?redirect=/cart'
      return
    }

    // 使用選中的長輩 ID
    const profileId = selectedProfile?.id

    try {
      toast.loading('正在建立訂單...')

      // Get current user email from Supabase
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      const userEmail = supabaseUser?.email

      const orderData = {
        profile_id: profileId,
        items: items.map((item) => ({
          menu_item_id: parseInt(item.id),
          quantity: item.quantity,
          special_instructions: item.id === 'special' ? specialInstructions : undefined,
        })),
        total_amount: cartTotal,
        customer_email: userEmail, // Pass user email to backend
      }

      const result = await api.createOrder(orderData)

      toast.dismiss()

      if (result.checkout_url) {
        window.location.href = result.checkout_url
      } else {
        toast.success('訂單建立成功')
        clearCart()
      }
    } catch (error) {
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : '建立訂單失敗')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="page-container space-y-6"
    >
      <h1 className="section-title">購物車</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Truck className="w-5 h-5 text-primary-500" />
                <span className="font-medium">配送對象</span>
              </div>
              <div className="flex space-x-2 overflow-x-auto">
                {loadingProfiles ? (
                  <div className="flex space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap bg-neutral-100 animate-pulse"
                        style={{ width: '80px', height: '36px' }}
                      />
                    ))}
                  </div>
                ) : profiles.length > 0 ? (
                  profiles.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => setSelectedProfile(profile)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                        selectedProfile?.id === profile.id
                          ? 'bg-primary-500 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      )}
                    >
                      {profile.name}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-neutral-500">尚無長輩檔案，請先新增</p>
                )}
              </div>
            </CardContent>
          </Card>

          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <span className="text-2xl">🍽️</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-neutral-800">{item.name}</h3>
                    <p className="text-primary-600 font-semibold">{mounted ? formatCurrency(item.price) : '$0.00'}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 rounded-lg bg-neutral-100 hover:bg-neutral-200"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded-lg bg-neutral-100 hover:bg-neutral-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-800">
                      {mounted ? formatCurrency(item.price * item.quantity) : '$0.00'}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>訂單摘要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">小計</span>
                  <span>{mounted ? formatCurrency(subtotal) : '$0.00'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">配送費</span>
                  <span>{mounted ? (deliveryFee === 0 ? '免費' : formatCurrency(deliveryFee)) : '$0.00'}</span>
                </div>
                {subtotal < 500 && (
                  <p className="text-xs text-primary-600 bg-primary-50 p-2 rounded">
                    滿 500 可享免費配送
                  </p>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>總計</span>
                    <span>{mounted ? formatCurrency(cartTotal) : '$0.00'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>配送時間</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary-500" />
                <span className="text-sm text-neutral-600">預計送達時間</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['11:00', '12:00', '13:00'].map((time) => (
                  <button
                    key={time}
                    onClick={() => setDeliveryTime(time)}
                    className={cn(
                      'py-2 rounded-lg text-sm font-medium transition-all',
                      deliveryTime === time
                        ? 'bg-primary-500 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>特殊需求</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="請輸入特殊飲食需求或配送說明..."
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows={3}
              />
            </CardContent>
          </Card>

          <Button className="w-full" size="lg" onClick={handleCheckout}>
            <CreditCard className="w-5 h-5 mr-2" />
            前往付款
          </Button>

          <p className="text-xs text-neutral-500 text-center">
            支援 Visa、MasterCard、JCB 信用卡
          </p>
        </div>
      </div>
    </motion.div>
  )
}
