'use client'

import { useAuth } from '@/hooks/use-auth'
import { NotFound } from '@/components/not-found'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  if (user?.role !== 'admin') {
    return <NotFound />
  }

  return <>{children}</>
}
