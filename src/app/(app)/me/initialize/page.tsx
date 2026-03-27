'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useRegisterMe } from '@/hooks/api/me'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function InitializePage() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [name, setName] = useState('')

  const mutation = useRegisterMe()

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/me">マイページ</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>初期設定</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle>プロフィール設定</CardTitle>
          <CardDescription>はじめに表示名を設定してください。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate({ name }, {
              onSuccess: async () => {
                await refreshUser()
                toast.success('プロフィールを設定しました')
                router.push('/')
              },
              onError: () => toast.error('設定に失敗しました'),
            }) }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">名前</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? '設定中...' : '設定する'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
