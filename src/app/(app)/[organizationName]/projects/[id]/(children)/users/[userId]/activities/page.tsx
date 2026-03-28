'use client'

import { useMemo, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { format, addMonths, addWeeks, startOfDay, endOfDay, startOfMonth, startOfWeek } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useProject, useProjectConfig } from '@/hooks/api/projects'
import { useActivities, useUpdateActivity, useDeleteActivity } from '@/hooks/api/activities'
import { useAssignments } from '@/hooks/api/assignments'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
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
import { ElapsedTime, calcElapsedMinutes } from '@/components/elapsed-time'
import { formatMinutes } from '@/domain/time'
import { InlineDateTimeEditor } from '@/components/features/inline-datetime-editor'
import { InlineTextEditor } from '@/components/features/inline-text-editor'
import { StartActivityDialog } from '@/components/start-activity-dialog'
import { DatePicker } from '@/components/ui/date-picker'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'

type PeriodUnit = 'weekly' | 'monthly'

function addPeriod(date: Date, unit: PeriodUnit, count: number): Date {
  return unit === 'weekly' ? addWeeks(date, count) : addMonths(date, count)
}

/** 今日を含むカレンダー区間（月初 or 週初）を返す */
function getCurrentPeriod(_projectCreatedAt: string, unit: PeriodUnit, period: number): { start: Date; end: Date } {
  const now = new Date()
  const base = unit === 'weekly'
    ? startOfWeek(now, { locale: ja })
    : startOfMonth(now)
  const start = addPeriod(base, unit, 0)
  const end = new Date(addPeriod(base, unit, period).getTime() - 1)
  return { start, end }
}

/** 期間を前後にずらす */
function shiftPeriod(current: { start: Date; end: Date }, direction: -1 | 1, unit: PeriodUnit, period: number): { start: Date; end: Date } {
  const start = addPeriod(current.start, unit, direction * period)
  const end = new Date(addPeriod(current.start, unit, (direction + 1) * period).getTime() - 1)
  return { start, end }
}

function DeleteButton({ activityId }: { activityId: string }) {
  const mutation = useDeleteActivity()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>稼働を削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>この操作は元に戻せません。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() =>
              mutation.mutate(activityId, {
                onSuccess: () => toast.success('削除しました'),
                onError: () => toast.error('削除に失敗しました'),
              })
            }
            disabled={mutation.isPending}
          >
            削除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
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
        await mutation.mutateAsync(id)
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

function formatAssignmentDate(iso: string | null): string {
  if (!iso) return '未定'
  return format(new Date(iso), 'yyyy/MM/dd', { locale: ja })
}

export default function ProjectUserActivitiesPage() {
  const { id: projectId, userId } = useParams<{ id: string; userId: string }>()
  const [startOpen, setStartOpen] = useState(false)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { data: config } = useProjectConfig(projectId)
  const { data: project } = useProject(projectId)

  const hasPeriod = config?.aggregationUnit !== 'none' && config?.aggregationUnit !== undefined
  const periodUnit = (config?.aggregationUnit === 'weekly' ? 'weekly' : 'monthly') as PeriodUnit
  const periodCount = config?.aggregationPeriod ?? 1
  const minuteStep = config?.roundingInterval ?? 15
  const roundingDirection = config?.roundingDirection ?? 'ceil'

  const defaultPeriod = useMemo(
    () => (project?.createdAt && hasPeriod ? getCurrentPeriod(project.createdAt, periodUnit, periodCount) : null),
    [project?.createdAt, hasPeriod, periodUnit, periodCount]
  )
  const [periodStart, setPeriodStart] = useState<Date | undefined>(undefined)
  const [periodEnd, setPeriodEnd] = useState<Date | undefined>(undefined)

  // defaultPeriod が確定したら初期値をセット
  const effectiveStart = periodStart ?? defaultPeriod?.start
  const effectiveEnd = periodEnd ?? defaultPeriod?.end

  const handlePrev = useCallback(() => {
    if (!effectiveStart || !effectiveEnd) return
    const next = shiftPeriod({ start: effectiveStart, end: effectiveEnd }, -1, periodUnit, periodCount)
    setPeriodStart(next.start)
    setPeriodEnd(next.end)
  }, [effectiveStart, effectiveEnd, periodUnit, periodCount])

  const handleNext = useCallback(() => {
    if (!effectiveStart || !effectiveEnd) return
    const next = shiftPeriod({ start: effectiveStart, end: effectiveEnd }, 1, periodUnit, periodCount)
    setPeriodStart(next.start)
    setPeriodEnd(next.end)
  }, [effectiveStart, effectiveEnd, periodUnit, periodCount])

  const { data: assignmentData } = useAssignments({ userId, projectId })
  const allAssignments = assignmentData?.items ?? []
  const activeAssignment = allAssignments.find(a => {
    if (!a.endedAt) return true
    return new Date(a.endedAt) >= new Date()
  }) ?? null

  const { data: activitiesData, isLoading, isFetching, refetch } = useActivities(
    {
      projectId,
      userId,
      ...(hasPeriod && effectiveStart && effectiveEnd
        ? { startDate: effectiveStart.toISOString(), endDate: effectiveEnd.toISOString() }
        : {}),
    },
    { enabled: config !== undefined && project !== undefined }
  )

  const activities = activitiesData?.items ?? []

  const allSelected = activities.length > 0 && activities.every(a => selectedIds.has(a.id))
  const someSelected = activities.some(a => selectedIds.has(a.id))

  function toggleAll(checked: boolean) {
    if (checked) {
      setSelectedIds(new Set(activities.map(a => a.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  function toggleOne(id: string, checked: boolean) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const totalMinutes = useMemo(
    () => activities.reduce((sum, a) => sum + calcElapsedMinutes(a.startedAt, a.endedAt), 0),
    [activities]
  )

  const updateMutation = useUpdateActivity()

  async function handleSave(activityId: string, field: string, value: string) {
    await updateMutation.mutateAsync({ id: activityId, body: { [field]: value } })
  }

  if (isLoading || config === undefined || project === undefined) return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-64" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>
      <div className="rounded-xl ring-1 ring-foreground/10 overflow-hidden">
        <div className="flex border-b">
          <div className="h-10 px-2 flex items-center"><Skeleton className="h-4 w-4" /></div>
          <div className="h-10 px-2 flex items-center"><Skeleton className="h-4 w-24" /></div>
          <div className="h-10 px-2 flex items-center"><Skeleton className="h-4 w-24" /></div>
          <div className="h-10 px-2 flex items-center"><Skeleton className="h-4 w-20" /></div>
          <div className="h-10 px-2 flex-1 flex items-center"><Skeleton className="h-4 w-16" /></div>
          <div className="h-10 px-2 flex items-center"><Skeleton className="h-4 w-7" /></div>
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex border-b last:border-0">
            <div className="h-10 px-2 flex items-center"><Skeleton className="h-4 w-4" /></div>
            <div className="h-10 px-2 flex items-center"><Skeleton className="h-4 w-28" /></div>
            <div className="h-10 px-2 flex items-center"><Skeleton className="h-4 w-28" /></div>
            <div className="h-10 px-2 flex items-center"><Skeleton className="h-4 w-16" /></div>
            <div className="h-10 px-2 flex-1 flex items-center"><Skeleton className="h-4 w-full" /></div>
            <div className="h-10 px-2 flex items-center"><Skeleton className="h-7 w-7 rounded-md" /></div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {hasPeriod && (
            <>
              <Button variant="ghost" size="icon" onClick={handlePrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <DatePicker
                value={effectiveStart}
                onValueChange={(d) => d && setPeriodStart(startOfDay(d))}
              />
              <span className="text-sm text-muted-foreground">-</span>
              <DatePicker
                value={effectiveEnd}
                onValueChange={(d) => d && setPeriodEnd(endOfDay(d))}
              />
              <Button variant="ghost" size="icon" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground ml-2">
                合計: <span className="font-medium text-foreground">{formatMinutes(totalMinutes)}</span>
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setStartOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            稼働を追加
          </Button>
        </div>
      </div>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            稼働がありません
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <BulkDeleteButton
                selectedIds={Array.from(selectedIds)}
                onComplete={() => setSelectedIds(new Set())}
              />
              <span className="text-sm text-muted-foreground">
                {selectedIds.size}件選択中
              </span>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-0">
                  <Checkbox
                    checked={allSelected || (someSelected && 'indeterminate')}
                    onCheckedChange={(value) => toggleAll(!!value)}
                    aria-label="すべて選択"
                  />
                </TableHead>
                <TableHead className="whitespace-nowrap w-0">開始</TableHead>
                <TableHead className="whitespace-nowrap w-0">終了</TableHead>
                <TableHead className="whitespace-nowrap w-0">経過時間</TableHead>
                <TableHead>内容</TableHead>
                <TableHead className="w-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map(activity => (
                <TableRow key={activity.id} data-state={selectedIds.has(activity.id) && 'selected'}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(activity.id)}
                      onCheckedChange={(value) => toggleOne(activity.id, !!value)}
                      aria-label="行を選択"
                    />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <InlineDateTimeEditor
                      value={activity.startedAt}
                      onSave={(iso) => handleSave(activity.id, 'startedAt', iso)}
                      minuteStep={minuteStep}
                      roundingDirection={roundingDirection}
                    />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <InlineDateTimeEditor
                      value={activity.endedAt}
                      onSave={(iso) => handleSave(activity.id, 'endedAt', iso)}
                      allowNull
                      nullLabel="進行中"
                      minuteStep={minuteStep}
                      roundingDirection={roundingDirection}
                    />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <ElapsedTime startedAt={activity.startedAt} endedAt={activity.endedAt} />
                  </TableCell>
                  <TableCell>
                    <InlineTextEditor
                      value={activity.note}
                      onSave={(text) => handleSave(activity.id, 'note', text)}
                    />
                  </TableCell>
                  <TableCell>
                    <DeleteButton activityId={activity.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <StartActivityDialog
        projectId={projectId}
        projectName={project?.name ?? ''}
        userId={userId}
        open={startOpen}
        onOpenChange={setStartOpen}
        assignments={allAssignments}
      />
    </div>
  )
}
