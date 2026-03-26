'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'

export default function ConfirmEmailPage() {
  const [done, setDone] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => setDone(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (done) {
      router.replace('/')
    }
  }, [done, router])

  return (
    <div className="space-y-4 text-center">
      <Skeleton className="mx-auto h-8 w-48" />
      <p className="text-sm text-muted-foreground">メールを確認しています...</p>
    </div>
  )
}
