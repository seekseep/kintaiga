import { Outlet } from 'react-router'
import { useAuth } from '@/hooks/use-auth'
import { NotFound } from '@/components/not-found'

export function AdminGuard() {
  const { user } = useAuth()

  if (user?.role !== 'admin') {
    return <NotFound />
  }

  return <Outlet />
}
