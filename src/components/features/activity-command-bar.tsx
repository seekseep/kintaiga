'use client'

import { useEffect, useMemo, useState } from 'react'
import { Terminal, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useUpdateActivity, useDeleteActivity } from '@/hooks/api/activities'
import { parseCommand, computePreview } from '@/domain/activity-command'
import type { ProjectActivity as Activity } from '@/api/organization/project/activitiy'

type ActivityPreview = {
  startedAt: string
  endedAt: string | null
}

type Props = {
  selectedIds: string[]
  activities: Activity[]
  onClearSelection: () => void
  onCommandPreview: (preview: Map<string, ActivityPreview> | null) => void
}

function BulkDeleteButton({ selectedIds, onComplete }: { selectedIds: string[]; onComplete: () => void }) {
  const mutation = useDeleteActivity()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleBulkDelete() {
    setIsDeleting(true)
    let successCount = 0
    let errorCount = 0
    for (const id of selectedIds) {
      try {
        await mutation.mutateAsync({ id })
        successCount++
      } catch {
        errorCount++
      }
    }
    setIsDeleting(false)
    if (errorCount === 0) {
      toast.success(`${successCount}件の稼働を削除しました`)
    } else {
      toast.error(`${errorCount}件の削除に失敗しました`)
    }
    onComplete()
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={isDeleting}>
          <Trash2 className="h-4 w-4 mr-1" />
          {selectedIds.length}件を削除
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{selectedIds.length}件の稼働を削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>この操作は元に戻せません。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={handleBulkDelete} disabled={isDeleting}>
            削除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function ActivityCommandBar({ selectedIds, activities, onClearSelection, onCommandPreview }: Props) {
  const [showCommandInput, setShowCommandInput] = useState(false)
  const [commandText, setCommandText] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const updateMutation = useUpdateActivity()

  const selectedActivities = useMemo(
    () => activities.filter((a) => selectedIds.includes(a.id)),
    [activities, selectedIds]
  )

  const parseResult = useMemo(
    () => (commandText.trim() ? parseCommand(commandText) : null),
    [commandText]
  )

  const preview = useMemo(() => {
    if (!parseResult || !parseResult.ok) return null
    return computePreview(parseResult.command, selectedActivities)
  }, [parseResult, selectedActivities])

  useEffect(() => {
    onCommandPreview(preview)
  }, [preview, onCommandPreview])

  function handleToggleCommand() {
    if (showCommandInput) {
      setShowCommandInput(false)
      setCommandText('')
      onCommandPreview(null)
    } else {
      setShowCommandInput(true)
    }
  }

  async function handleExecute() {
    if (!preview) return
    setIsExecuting(true)
    let successCount = 0
    let errorCount = 0
    for (const id of selectedIds) {
      const previewData = preview.get(id)
      if (!previewData) continue
      try {
        await updateMutation.mutateAsync({
          id,
          startedAt: previewData.startedAt, endedAt: previewData.endedAt,
        })
        successCount++
      } catch {
        errorCount++
      }
    }
    setIsExecuting(false)
    if (errorCount === 0) {
      toast.success(`${successCount}件の稼働を更新しました`)
    } else {
      toast.error(`${errorCount}件の更新に失敗しました`)
    }
    setShowCommandInput(false)
    setCommandText('')
    onClearSelection()
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <BulkDeleteButton selectedIds={selectedIds} onComplete={onClearSelection} />
        <Button
          variant={showCommandInput ? 'secondary' : 'outline'}
          size="sm"
          onClick={handleToggleCommand}
        >
          <Terminal className="h-4 w-4 mr-1" />
          コマンド
        </Button>
        <span className="text-sm text-muted-foreground">
          {selectedIds.length}件選択中
        </span>
      </div>
      {showCommandInput && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Input
              value={commandText}
              onChange={(e) => setCommandText(e.target.value)}
              placeholder="例: +1h, start 09:00, date 2026-03-25"
              className="font-mono text-sm max-w-md"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && parseResult?.ok) {
                  handleExecute()
                }
              }}
            />
            {commandText.trim() && parseResult?.ok && (
              <Button size="sm" onClick={handleExecute} disabled={isExecuting}>
                {isExecuting ? '実行中...' : '実行'}
              </Button>
            )}
          </div>
          {commandText.trim() && parseResult && !parseResult.ok && (
            <p className="text-destructive text-xs">{parseResult.error}</p>
          )}
        </div>
      )}
    </div>
  )
}
