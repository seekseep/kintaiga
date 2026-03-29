import { createContext, useEffect, useState, useCallback, useRef } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getMe } from '@/api/me'
import { ApiError } from '@/lib/api'
import type { User } from '@/api/organization/members'

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
  const fetchingRef = useRef(false)

  const fetchUser = useCallback(async () => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    try {
      const u = await getMe()
      setUser(u)
      setNeedsInitialization(false)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setUser(null)
        setNeedsInitialization(true)
      }
    } finally {
      fetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      if (session) {
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          try { await fetchUser() } finally { setIsLoading(false) }
        }
      } else {
        setUser(null)
        setNeedsInitialization(false)
        setIsLoading(false)
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
