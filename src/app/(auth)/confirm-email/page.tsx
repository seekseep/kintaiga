'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'

export default function ConfirmEmailPage() {
  const [done, setDone] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function syncEmail() {
      try {
        await api.post('/me/sync-email')
      } catch {
        // 同期失敗しても続行
      }
      setDone(true)
    }
    syncEmail()
  }, [])

  useEffect(() => {
    if (done) {
      router.replace('/')
    }
  }, [done, router])

  return (
    <div className="space-y-4 text-center">
      <Skeleton className="mx-auto h-8 w-48" />
      <p className="text-sm text-muted-foreground">メールアドレスを確認しています...</p>
    </div>
  )
}
