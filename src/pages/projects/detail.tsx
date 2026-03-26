import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { api } from '@/lib/api'
import type { User } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

type Project = { id: string; name: string; description: string | null }
type Assignment = { id: string; projectId: string; userId: string }

export function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [assignedUsers, setAssignedUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    Promise.all([
      api.get<Project>(`/projects/${id}`),
      api.get<Assignment[]>(`/assignments?projectId=${id}`),
      api.get<User[]>('/users'),
    ]).then(([proj, assignments, users]) => {
      setProject(proj)
      setName(proj.name)
      setDescription(proj.description ?? '')
      const assignedIds = new Set(assignments.map(a => a.userId))
      setAssignedUsers(users.filter(u => assignedIds.has(u.id)))
    }).finally(() => setLoading(false))
  }, [id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await api.patch<Project>(`/projects/${id}`, { name, description: description || null })
      setProject(updated)
      setEditing(false)
      toast.success('更新しました')
    } catch {
      toast.error('更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    await api.delete(`/projects/${id}`)
    toast.success('削除しました')
    navigate('/projects')
  }

  if (loading) return <Skeleton className="h-64" />
  if (!project) return <p className="text-center text-muted-foreground">プロジェクトが見つかりません</p>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{project.name}</CardTitle>
            <div className="flex gap-2">
              {!editing && <Button variant="outline" onClick={() => setEditing(true)}>編集</Button>}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">削除</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                    <AlertDialogDescription>プロジェクトとアサインメントが削除されます。</AlertDialogDescription>
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
              <Label>説明</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} disabled={!editing} />
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

      <Separator />

      <div>
        <h2 className="mb-4 text-xl font-semibold">アサイン済みユーザー</h2>
        {assignedUsers.length === 0 ? (
          <p className="text-muted-foreground">ユーザーがアサインされていません</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ユーザー</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedUsers.map(u => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Link to={`/projects/${id}/user/${u.id}`} className="flex items-center gap-3 hover:underline">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={u.iconUrl ?? undefined} />
                        <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {u.name}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
