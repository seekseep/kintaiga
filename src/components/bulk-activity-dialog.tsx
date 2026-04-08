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
import { useActivities, useCreateActivity } from '@/hooks/api/activities'
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

type OkResult = Extract<BulkParseLineResult, { ok: true }>

type EnrichedResult =
  | (OkResult & { duplicate: boolean })
  | Extract<BulkParseLineResult, { ok: false }>

function todayLocalDate(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function ResultRow({ result }: { result: EnrichedResult }) {
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
    <div
      className={
        result.duplicate
          ? 'rounded-md border border-amber-500/40 bg-amber-500/5 p-2'
          : 'rounded-md border bg-card p-2'
      }
    >
      <button
        type="button"
        className="flex w-full items-center gap-1 text-left text-sm"
        onClick={() => setExpanded((v) => !v)}
      >
        <Chevron className="h-4 w-4 shrink-0" />
        <span className="truncate">{result.raw}</span>
        {result.duplicate && (
          <span className="ml-auto shrink-0 text-xs text-amber-600">既に登録済</span>
        )}
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
          {result.duplicate && (
            <div className="text-amber-600">同じ開始日時の稼働が既に存在するためスキップされます</div>
          )}
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

  // 進捗ダイアログ
  const [progressOpen, setProgressOpen] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0, failed: 0 })

  const createMutation = useCreateActivity()

  // 重複チェック用に既存稼働を取得
  const { data: existingData } = useActivities(
    { projectId, userId },
    { enabled: open },
  )
  const existingStartedAtSet = useMemo(() => {
    const set = new Set<number>()
    existingData?.items.forEach((a) => {
      set.add(new Date(a.startedAt).getTime())
    })
    return set
  }, [existingData])

  const results = useMemo<EnrichedResult[]>(() => {
    if (!text.trim()) return []
    return parseBulkActivities(text, { baseDate }).map((r) => {
      if (!r.ok) return r
      const duplicate = existingStartedAtSet.has(new Date(r.startedAt).getTime())
      return { ...r, duplicate }
    })
  }, [text, baseDate, existingStartedAtSet])

  const okResults = results.filter((r): r is OkResult & { duplicate: boolean } => r.ok)
  const targetResults = okResults.filter((r) => !r.duplicate)
  const duplicateCount = okResults.length - targetResults.length
  const errorCount = results.length - okResults.length

  const handleClose = (value: boolean) => {
    if (!value) {
      setText('')
      setBaseDate(todayLocalDate())
    }
    onOpenChange(value)
  }

  const handleSubmit = async () => {
    if (targetResults.length === 0) return
    // テキストダイアログを閉じてローディングダイアログを開く
    onOpenChange(false)
    setProgress({ done: 0, total: targetResults.length, failed: 0 })
    setProgressOpen(true)

    let success = 0
    let failure = 0
    const errors: string[] = []
    for (const r of targetResults) {
      try {
        await createMutation.mutateAsync({
          projectId,
          userId,
          startedAt: r.startedAt,
          endedAt: r.endedAt ?? undefined,
          note: r.note ?? undefined,
        })
        success += 1
      } catch (e) {
        failure += 1
        errors.push(e instanceof Error ? e.message : String(e))
      }
      setProgress({ done: success + failure, total: targetResults.length, failed: failure })
    }

    setProgressOpen(false)
    setText('')
    setBaseDate(todayLocalDate())
    if (failure === 0) {
      toast.success(`${success} 件追加しました`)
    } else {
      toast.error(`${success} 件追加、${failure} 件失敗: ${errors[0] ?? ''}`)
    }
  }

  return (
    <>
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
                  {targetResults.length} 件登録対象
                  {duplicateCount > 0 && ` / ${duplicateCount} 件重複スキップ`}
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
            <Button variant="outline" onClick={() => handleClose(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSubmit} disabled={targetResults.length === 0}>
              {targetResults.length} 件追加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={progressOpen} onOpenChange={() => {/* 閉じれない */}}>
        <DialogContent className="sm:max-w-sm" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>稼働を登録しています</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="text-sm tabular-nums">
              {progress.done} / {progress.total} 件
              {progress.failed > 0 && (
                <span className="ml-2 text-destructive">({progress.failed} 件失敗)</span>
              )}
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width:
                    progress.total > 0
                      ? `${(progress.done / progress.total) * 100}%`
                      : '0%',
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
