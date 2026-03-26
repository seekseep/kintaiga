import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export function InitializePage() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/me', { name })
      await refreshUser()
      toast.success('プロフィールを設定しました')
      navigate('/')
    } catch {
      toast.error('設定に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>プロフィール設定</CardTitle>
          <CardDescription>はじめに表示名を設定してください。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">名前</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '設定中...' : '設定する'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
