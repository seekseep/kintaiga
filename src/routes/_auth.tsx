import { useEffect } from 'react'
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

function AuthLayout() {
  const { session, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && session) {
      navigate({ to: '/', replace: true })
    }
  }, [isLoading, session, navigate])

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <img src="/favicon.png" alt="キンタイガ" className="animate-pulse h-24 w-24" />
      </div>
    )
  }

  if (session) return null

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">キンタイガ</CardTitle>
        </CardHeader>
        <CardContent>
          <Outlet />
        </CardContent>
      </Card>
    </div>
  )
}
