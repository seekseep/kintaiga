import { useState } from 'react'
import { useNavigate } from 'react-router'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function ActivityNewPage() {
  const navigate = useNavigate()
  const [type, setType] = useState('')
  const [startedAt, setStartedAt] = useState('')
  const [endedAt, setEndedAt] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/activities', {
        type,
        startedAt: new Date(startedAt).toISOString(),
        endedAt: endedAt ? new Date(endedAt).toISOString() : null,
        note: note || null,
      })
      toast.success('アクティビティを作成しました')
      navigate('/')
    } catch {
      toast.error('作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>新規アクティビティ</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>タイプ</Label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
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
              <Label htmlFor="startedAt">開始日時</Label>
              <Input id="startedAt" type="datetime-local" value={startedAt} onChange={e => setStartedAt(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endedAt">終了日時（任意）</Label>
              <Input id="endedAt" type="datetime-local" value={endedAt} onChange={e => setEndedAt(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">メモ（任意）</Label>
              <Textarea id="note" value={note} onChange={e => setNote(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '作成中...' : '作成'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
