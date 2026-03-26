import { useEffect, useState } from 'react'
import { Navigate } from 'react-router'
import { Skeleton } from '@/components/ui/skeleton'

export function ConfirmEmailPage() {
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Supabase client automatically handles the token from URL hash
    // via onAuthStateChange. Just wait briefly then redirect.
    const timer = setTimeout(() => setDone(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (done) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="space-y-4 text-center">
      <Skeleton className="mx-auto h-8 w-48" />
      <p className="text-sm text-muted-foreground">メールを確認しています...</p>
    </div>
  )
}
