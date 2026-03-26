'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { createActivity } from '@/api/activities'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function ActivityNewPage() {
  const router = useRouter()
  const [type, setType] = useState('')
  const [startedAt, setStartedAt] = useState('')
  const [endedAt, setEndedAt] = useState('')
  const [note, setNote] = useState('')

  const mutation = useMutation({
    mutationFn: () => createActivity({
      type,
      startedAt: new Date(startedAt).toISOString(),
      endedAt: endedAt ? new Date(endedAt).toISOString() : undefined,
      note: note || undefined,
    }),
    onSuccess: () => {
      toast.success('アクティビティを作成しました')
      router.push('/')
    },
    onError: () => toast.error('作成に失敗しました'),
  })

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>新規アクティビティ</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate() }} className="space-y-4">
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
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? '作成中...' : '作成'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
