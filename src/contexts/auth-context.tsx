import { createContext, useEffect, useState, useCallback, useRef } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getMe } from '@/api/me'
import { ApiError } from '@/lib/api'
import type { User } from '@/schemas'

export type { User }

export type AuthContextValue = {
  session: Session | null
  user: User | null
  isLoading: boolean
  needsInitialization: boolean
  error: Error | null
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
  const [error, setError] = useState<Error | null>(null)
  const fetchingRef = useRef(false)

  const fetchUser = useCallback(async () => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    try {
      const u = await getMe()
      setUser(u)
      setNeedsInitialization(false)
      setError(null)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setUser(null)
        setNeedsInitialization(true)
        setError(null)
      } else {
        console.error('Failed to fetch user', e)
        setUser(null)
        setNeedsInitialization(false)
        setError(e instanceof Error ? e : new Error(String(e)))
      }
    } finally {
      fetchingRef.current = false
    }
  }, [])

  const refreshUser = useCallback(async () => {
    // セッションをリフレッシュして最新のJWT（app_metadata.role含む）を取得
    const { data: { session } } = await supabase.auth.refreshSession()
    if (session) {
      setSession(session)
    }
    fetchingRef.current = false // fetchUserのガードをリセット
    await fetchUser()
  }, [fetchUser])

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
    <AuthContext.Provider value={{ session, user, isLoading, needsInitialization, error, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}
