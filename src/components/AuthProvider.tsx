'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)
    const { login, logout, user, isAuthenticated } = useAuthStore()

    useEffect(() => {
        setMounted(true)

        // Initialize auth from Supabase session
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()

            if (session?.access_token) {
                api.setToken(session.access_token)
            }

            if (session?.user) {
                login({
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                })
            }
        }

        initAuth()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.access_token) {
                api.setToken(session.access_token)
            } else {
                api.clearToken()
            }

            if (event === 'SIGNED_IN' && session?.user) {
                login({
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                })
            } else if (event === 'SIGNED_OUT') {
                logout()
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [login, logout])

    // Avoid hydration mismatch
    if (!mounted) {
        return <>{children}</>
    }

    return <>{children}</>
}
