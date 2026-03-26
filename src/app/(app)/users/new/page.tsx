'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { createUser } from '@/api/users'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function UserNewPage() {
  const router = useRouter()
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'admin' | 'general'>('general')

  const mutation = useMutation({
    mutationFn: () => createUser({ id, name, role }),
    onSuccess: () => {
      toast.success('ユーザーを作成しました')
      router.push('/users')
    },
    onError: () => toast.error('作成に失敗しました'),
  })

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>新規ユーザー</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate() }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="id">ユーザーID（Supabase Auth ID）</Label>
              <Input id="id" value={id} onChange={e => setId(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">名前</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>ロール</Label>
              <Select value={role} onValueChange={v => setRole(v as 'admin' | 'general')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">一般</SelectItem>
                  <SelectItem value="admin">管理者</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? '作成中...' : '作成'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
