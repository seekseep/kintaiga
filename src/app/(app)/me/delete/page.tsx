'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useWithdrawMe } from '@/hooks/api/me'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function DeleteAccountPage() {
  const { user } = useAuth()
  const mutation = useWithdrawMe()
  const [confirmation, setConfirmation] = useState('')

  if (!user) return null

  const isConfirmed = confirmation === '削除する'

  const handleDelete = async () => {
    mutation.mutate(undefined, {
      onSuccess: async () => {
        await supabase.auth.signOut()
        toast.success('アカウントを削除しました')
        window.location.href = '/login'
      },
      onError: () => {
        toast.error('削除に失敗しました')
      },
    })
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/me">マイページ</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>アカウント削除</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle>アカウントの削除</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4 space-y-2">
            <p className="text-sm font-medium text-destructive">この操作は取り消せません</p>
            <p className="text-sm text-muted-foreground">
              アカウントを削除すると、ユーザー情報は「削除されたユーザー」としてアーカイブされます。
              名前やメールアドレスなどの個人情報は削除されます。
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmation">
              確認のため「削除する」と入力してください
            </Label>
            <Input
              id="confirmation"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="削除する"
            />
          </div>
          <Button
            variant="destructive"
            className="w-full"
            disabled={!isConfirmed || mutation.isPending}
            onClick={handleDelete}
          >
            {mutation.isPending ? '削除中...' : 'アカウントを削除'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
