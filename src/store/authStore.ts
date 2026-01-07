import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '@/lib/auth-api'

interface User {
  id: string
  email: string
  name: string
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  initialized: boolean
  login: (user: User) => void
  logout: () => void
  setUser: (user: User | null) => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      initialized: false,

      login: (user) => {
        set({ user, isAuthenticated: true })
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user })
      },

      initialize: async () => {
        if (get().initialized) return

        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'
          }
          set({ user, isAuthenticated: true, initialized: true })
        } else {
          set({ initialized: true })
        }

        // Listen for auth state changes
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const user: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'
            }
            set({ user, isAuthenticated: true, initialized: true })
          } else if (event === 'SIGNED_OUT') {
            set({ user: null, isAuthenticated: false, initialized: true })
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            const user: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'
            }
            set({ user, isAuthenticated: true, initialized: true })
          } else if (event === 'INITIAL_SESSION' && session?.user) {
            const user: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'
            }
            set({ user, isAuthenticated: true, initialized: true })
          }
        })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
