import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'
import { updateMe } from '@/api/me'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function EditNamePage() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const [name, setName] = useState(user?.name ?? '')

  const mutation = useMutation({
    mutationFn: () => updateMe({ name }),
    onSuccess: async () => {
      await refreshUser()
      toast.success('名前を変更しました')
      navigate('/me')
    },
    onError: () => toast.error('変更に失敗しました'),
  })

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>名前の変更</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate() }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">名前</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? '変更中...' : '変更する'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
