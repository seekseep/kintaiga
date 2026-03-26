import { createContext, useEffect, useState, useCallback } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { api, ApiError } from '@/lib/api'

export type User = {
  id: string
  name: string
  role: 'admin' | 'general'
  iconUrl: string | null
  createdAt: string
  updatedAt: string
}

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
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [needsInitialization, setNeedsInitialization] = useState(false)

  const fetchUser = useCallback(async () => {
    try {
      const u = await api.get<User>('/me')
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchUser().finally(() => setIsLoading(false))
      } else {
        setIsLoading(false)
      }
    })

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
    setSession(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ session, user, isLoading, needsInitialization, signOut, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}
