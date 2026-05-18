import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { syncMyEmail } from '@/api/me'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/_auth/confirm-email')({
  component: ConfirmEmailPage,
})

function ConfirmEmailPage() {
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function syncEmail() {
      try {
        await syncMyEmail()
      } catch {
        // 同期失敗しても続行
      }
      setDone(true)
    }
    syncEmail()
  }, [])

  useEffect(() => {
    if (done) {
      navigate({ to: '/', replace: true })
    }
  }, [done, navigate])

  return (
    <div className="space-y-4 text-center">
      <Skeleton className="mx-auto h-8 w-48" />
      <p className="text-sm text-muted-foreground">メールアドレスを確認しています...</p>
    </div>
  )
}
