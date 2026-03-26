import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function EditNamePage() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.patch('/me', { name })
      await refreshUser()
      toast.success('名前を変更しました')
      navigate('/me')
    } catch {
      toast.error('変更に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>名前の変更</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">名前</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '変更中...' : '変更する'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
