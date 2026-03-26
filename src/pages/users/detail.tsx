import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { api } from '@/lib/api'
import type { User } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'

export function UserDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState<'admin' | 'general'>('general')

  useEffect(() => {
    api.get<User>(`/users/${id}`)
      .then(u => {
        setUser(u)
        setName(u.name)
        setRole(u.role)
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await api.patch<User>(`/users/${id}`, { name, role })
      setUser(updated)
      setEditing(false)
      toast.success('更新しました')
    } catch {
      toast.error('更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    await api.delete(`/users/${id}`)
    toast.success('削除しました')
    navigate('/users')
  }

  if (loading) return <Skeleton className="mx-auto h-64 max-w-lg" />
  if (!user) return <p className="text-center text-muted-foreground">ユーザーが見つかりません</p>

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.iconUrl ?? undefined} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{user.name}</CardTitle>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role === 'admin' ? '管理者' : '一般'}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {!editing && <Button variant="outline" onClick={() => setEditing(true)}>編集</Button>}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">削除</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                    <AlertDialogDescription>このユーザーに関連するデータも削除されます。</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>削除</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>名前</Label>
              <Input value={name} onChange={e => setName(e.target.value)} disabled={!editing} />
            </div>
            <div className="space-y-2">
              <Label>ロール</Label>
              <Select value={role} onValueChange={v => setRole(v as 'admin' | 'general')} disabled={!editing}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">一般</SelectItem>
                  <SelectItem value="admin">管理者</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editing && (
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={saving}>{saving ? '保存中...' : '保存'}</Button>
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>キャンセル</Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
