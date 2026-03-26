import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'

type Activity = {
  id: string
  type: string
  startedAt: string
  endedAt: string | null
  note: string | null
}

function toLocalDatetime(iso: string) {
  const d = new Date(iso)
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

export function ActivityDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [type, setType] = useState('')
  const [startedAt, setStartedAt] = useState('')
  const [endedAt, setEndedAt] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    api.get<Activity>(`/activities/${id}`)
      .then(a => {
        setActivity(a)
        setType(a.type)
        setStartedAt(toLocalDatetime(a.startedAt))
        setEndedAt(a.endedAt ? toLocalDatetime(a.endedAt) : '')
        setNote(a.note ?? '')
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await api.patch<Activity>(`/activities/${id}`, {
        type,
        startedAt: new Date(startedAt).toISOString(),
        endedAt: endedAt ? new Date(endedAt).toISOString() : null,
        note: note || null,
      })
      setActivity(updated)
      setEditing(false)
      toast.success('更新しました')
    } catch {
      toast.error('更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    await api.delete(`/activities/${id}`)
    toast.success('削除しました')
    navigate('/')
  }

  if (loading) return <Skeleton className="mx-auto h-64 max-w-lg" />
  if (!activity) return <p className="text-center text-muted-foreground">アクティビティが見つかりません</p>

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>アクティビティ詳細</CardTitle>
            <div className="flex gap-2">
              {!editing && <Button variant="outline" onClick={() => setEditing(true)}>編集</Button>}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">削除</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                    <AlertDialogDescription>この操作は取り消せません。</AlertDialogDescription>
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
              <Label>タイプ</Label>
              <Select value={type} onValueChange={setType} disabled={!editing}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clock_in">出勤</SelectItem>
                  <SelectItem value="clock_out">退勤</SelectItem>
                  <SelectItem value="break_start">休憩開始</SelectItem>
                  <SelectItem value="break_end">休憩終了</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>開始日時</Label>
              <Input type="datetime-local" value={startedAt} onChange={e => setStartedAt(e.target.value)} disabled={!editing} />
            </div>
            <div className="space-y-2">
              <Label>終了日時</Label>
              <Input type="datetime-local" value={endedAt} onChange={e => setEndedAt(e.target.value)} disabled={!editing} />
            </div>
            <div className="space-y-2">
              <Label>メモ</Label>
              <Textarea value={note} onChange={e => setNote(e.target.value)} disabled={!editing} />
            </div>
            {editing && (
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? '保存中...' : '保存'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>キャンセル</Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
