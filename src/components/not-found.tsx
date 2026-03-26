'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">ページが見つかりません</p>
      <Button asChild variant="outline">
        <Link href="/">ホームに戻る</Link>
      </Button>
    </div>
  )
}
