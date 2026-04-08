'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useCreateActivity } from '@/hooks/api/activities'
import { parseBulkActivities, type BulkParseLineResult } from '@/domain/activity/bulk-parse'
import { isoToLocalDatetimeString } from '@/domain/utils/date'
import { ChevronDown, ChevronRight } from 'lucide-react'

type Props = {
  projectId: string
  projectName: string
  userId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function todayLocalDate(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function ResultRow({ result }: { result: BulkParseLineResult }) {
  const [expanded, setExpanded] = useState(false)
  const Chevron = expanded ? ChevronDown : ChevronRight

  if (!result.ok) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/5 p-2">
        <button
          type="button"
          className="flex w-full items-center gap-1 text-left text-sm"
          onClick={() => setExpanded((v) => !v)}
        >
          <Chevron className="h-4 w-4 shrink-0" />
          <span className="text-destructive">エラー:</span>
          <span className="truncate">{result.error}</span>
        </button>
        {expanded && (
          <div className="mt-2 space-y-1 pl-5 text-xs text-muted-foreground">
            <div>行 {result.lineNumber}</div>
            <div>元テキスト: {result.raw}</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-card p-2">
      <button
        type="button"
        className="flex w-full items-center gap-1 text-left text-sm"
        onClick={() => setExpanded((v) => !v)}
      >
        <Chevron className="h-4 w-4 shrink-0" />
        <span className="truncate">{result.raw}</span>
      </button>
      {expanded && (
        <div className="mt-2 space-y-1 pl-5 text-xs text-muted-foreground">
          <div>開始: {isoToLocalDatetimeString(result.startedAt).replace('T', ' ')}</div>
          <div>
            終了:{' '}
            {result.endedAt
              ? isoToLocalDatetimeString(result.endedAt).replace('T', ' ')
              : '（未指定）'}
          </div>
          <div>内容: {result.note ?? '（なし）'}</div>
        </div>
      )}
    </div>
  )
}

export function BulkActivityDialog({
  projectId,
  projectName,
  userId,
  open,
  onOpenChange,
}: Props) {
  const [text, setText] = useState('')
  const [baseDate, setBaseDate] = useState(todayLocalDate)
  const [submitting, setSubmitting] = useState(false)
  const createMutation = useCreateActivity()

  const results = useMemo(
    () => (text.trim() ? parseBulkActivities(text, { baseDate }) : []),
    [text, baseDate],
  )

  const okCount = results.filter((r) => r.ok).length
  const errorCount = results.length - okCount

  const handleClose = (value: boolean) => {
    if (!value) {
      setText('')
      setBaseDate(todayLocalDate())
    }
    onOpenChange(value)
  }

  const handleSubmit = async () => {
    const okResults = results.filter((r): r is Extract<BulkParseLineResult, { ok: true }> => r.ok)
    if (okResults.length === 0) return
    setSubmitting(true)
    let success = 0
    let failure = 0
    for (const r of okResults) {
      try {
        await createMutation.mutateAsync({
          projectId,
          userId,
          startedAt: r.startedAt,
          endedAt: r.endedAt ?? undefined,
          note: r.note ?? undefined,
        })
        success += 1
      } catch {
        failure += 1
      }
    }
    setSubmitting(false)
    if (failure === 0) {
      toast.success(`${success} 件追加しました`)
      handleClose(false)
    } else {
      toast.error(`${success} 件追加、${failure} 件失敗しました`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>稼働を一括登録</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>プロジェクト名</Label>
            <Input value={projectName} readOnly disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bulk-base-date">基準日（時刻のみの行に使用）</Label>
            <Input
              id="bulk-base-date"
              type="date"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bulk-text">テキスト</Label>
            <Textarea
              id="bulk-text"
              rows={8}
              value={text}
              placeholder={'2026/04/01 11:00 - 2026/04/01 18:00\n2026/04/02 10:00 - 2026/04/02 18:00'}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          {results.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                {okCount} 件パース可能
                {errorCount > 0 && ` / ${errorCount} 件エラー`}
              </div>
              <div className="space-y-1">
                {results.map((r) => (
                  <ResultRow key={r.lineNumber} result={r} />
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={submitting}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || okCount === 0}>
            {submitting ? '追加中...' : `${okCount} 件追加`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
