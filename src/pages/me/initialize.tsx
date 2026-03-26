import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'
import { registerMe } from '@/api/me'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export function InitializePage() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [name, setName] = useState('')

  const mutation = useMutation({
    mutationFn: () => registerMe({ name }),
    onSuccess: async () => {
      await refreshUser()
      toast.success('プロフィールを設定しました')
      navigate('/')
    },
    onError: () => toast.error('設定に失敗しました'),
  })

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>プロフィール設定</CardTitle>
          <CardDescription>はじめに表示名を設定してください。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate() }} className="space-y-4">
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
