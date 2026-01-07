'use client'

import { Button } from '@/components/ui'
import { Avatar } from '@/components/ui/Avatar'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Utensils,
  ShoppingCart,
  MessageCircle,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'

const navItems = [
  { href: '/dashboard', label: '首頁', icon: LayoutDashboard },
  { href: '/menu', label: '餐點', icon: Utensils },
  { href: '/cart', label: '購物車', icon: ShoppingCart },
  { href: '/chat', label: '客服', icon: MessageCircle },
  { href: '/profile', label: '個人', icon: User },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
    api.clearToken()
    router.push('/login')
  }

  // Show placeholder until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-neutral-200 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">銀</span>
              </div>
              <span className="text-xl font-bold text-neutral-800">銀髮族送餐</span>
            </Link>
          </div>
        </nav>
      </header>
    )
  }

  const userInitial = user?.name?.charAt(0) || user?.email?.charAt(0) || '?'

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-neutral-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="主要導航">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">銀</span>
            </div>
            <span className="text-xl font-bold text-neutral-800">銀髮族送餐</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <Avatar fallback={userInitial} size="sm" status="online" />
                <span className="text-sm text-gray-700">{user.name || user.email}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  登出
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  登入
                </Button>
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? '關閉選單' : '開啟選單'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-neutral-100">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center space-x-3 px-3">
                    <Avatar fallback={userInitial} size="sm" status="online" />
                    <span className="text-sm font-medium text-neutral-700">{user.name || user.email}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    登出
                  </Button>
                </>
              ) : (
                <Link href="/login" className="px-3" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm">
                    登入
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
