import { createContext, useEffect, useState, useCallback } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getMe } from '@/api/me'
import { ApiError } from '@/lib/api'
import type { User } from '@/api/users'

export type { User }

export type AuthContextValue = {
  session: Session | null
  user: User | null
  isLoading: boolean
  needsInitialization: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [needsInitialization, setNeedsInitialization] = useState(false)

  const fetchUser = useCallback(async () => {
    try {
      const u = await getMe()
      setUser(u)
      setNeedsInitialization(false)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setUser(null)
        setNeedsInitialization(true)
      }
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      if (session) {
        try { await fetchUser() } finally { setIsLoading(false) }
      } else {
        setIsLoading(false)
      }
    })()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchUser()
      } else {
        setUser(null)
        setNeedsInitialization(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchUser])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    queryClient.clear()
    setSession(null)
    setUser(null)
  }, [queryClient])

  return (
    <AuthContext.Provider value={{ session, user, isLoading, needsInitialization, signOut, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}
