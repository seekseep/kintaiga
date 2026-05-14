'use client'

import { Fragment, useMemo, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Trash2, Plus, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfDay,
  format,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ja } from 'date-fns/locale'
import { useProject, useProjectConfig } from '@/hooks/api/projects'
import { useActivities, useUpdateActivity, useDeleteActivity } from '@/hooks/api/activities'
import { useProjectMemberAssignments } from '@/hooks/api/project-members'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
import { formatMinutes } from '@/domain/utils/time'
import { InlineDateTimeEditor } from '@/components/features/inline-datetime-editor'
import { InlineTextEditor } from '@/components/features/inline-text-editor'
import { ActivityDialog } from '@/components/activity-dialog'
import { DatePicker } from '@/components/ui/date-picker'
import type { ProjectActivity } from '@/api/organization/project/activitiy'

type PeriodUnit = 'weekly' | 'monthly'

function addPeriod(date: Date, unit: PeriodUnit, count: number): Date {
  return unit === 'weekly' ? addWeeks(date, count) : addMonths(date, count)
}

function getCurrentPeriod(_projectCreatedAt: string, unit: PeriodUnit, period: number): { start: Date; end: Date } {
  const now = new Date()
  const base = unit === 'weekly'
    ? startOfWeek(now, { locale: ja })
    : startOfMonth(now)
  const start = addPeriod(base, unit, 0)
  const end = new Date(addPeriod(base, unit, period).getTime() - 1)
  return { start, end }
}

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
              mutation.mutate({ id: activityId }, {
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

type DayGroup = {
  date: Date
  activities: ProjectActivity[]
  totalMinutes: number
}

function groupActivitiesByDay(days: Date[], activities: ProjectActivity[]): DayGroup[] {
  return days.map(date => {
    const dayActivities = activities
      .filter(a => isSameDay(new Date(a.startedAt), date))
      .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
    const totalMinutes = dayActivities.reduce(
      (sum, a) => sum + calcElapsedMinutes(a.startedAt, a.endedAt),
      0,
    )
    return { date, activities: dayActivities, totalMinutes }
  })
}

export default function ProjectUserActivitiesPage() {
  const { id: projectId, memberId: userId } = useParams<{ id: string; memberId: string }>()

  const [dialogState, setDialogState] = useState<{ open: boolean; baseDate?: Date }>({ open: false })

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

  const { data: assignmentData } = useProjectMemberAssignments({ userId, projectId })
  const allAssignments = assignmentData?.items ?? []

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

  const days = useMemo(() => {
    if (effectiveStart && effectiveEnd) {
      return eachDayOfInterval({ start: startOfDay(effectiveStart), end: endOfDay(effectiveEnd) })
    }
    if (activities.length === 0) return []
    const times = activities.map(a => new Date(a.startedAt).getTime())
    const min = new Date(Math.min(...times))
    const max = new Date(Math.max(...times))
    return eachDayOfInterval({ start: startOfDay(min), end: endOfDay(max) })
  }, [effectiveStart, effectiveEnd, activities])

  const dayGroups = useMemo(() => groupActivitiesByDay(days, activities), [days, activities])

  const totalMinutes = useMemo(
    () => activities.reduce((sum, a) => sum + calcElapsedMinutes(a.startedAt, a.endedAt), 0),
    [activities]
  )

  const updateMutation = useUpdateActivity()

  async function handleSave(activityId: string, field: string, value: string) {
    await updateMutation.mutateAsync({ id: activityId, [field]: value })
  }

  function openAddDialog(date: Date) {
    setDialogState({ open: true, baseDate: date })
  }

  if (isLoading || config === undefined || project === undefined) return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="rounded-xl ring-1 ring-foreground/10 overflow-hidden">
          <div className="h-10 px-3 flex items-center justify-between bg-muted/40">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-7 w-20 rounded-md" />
          </div>
          <div className="h-12 px-3 flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 flex-1" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
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
              <span className="text-sm text-muted-foreground ml-2 whitespace-nowrap">
                合計: <span className="font-medium text-foreground">{formatMinutes(totalMinutes)}</span>
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {dayGroups.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            表示する日付がありません
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl ring-1 ring-foreground/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap w-0">開始</TableHead>
                <TableHead className="whitespace-nowrap w-0">終了</TableHead>
                <TableHead className="whitespace-nowrap w-0">経過時間</TableHead>
                <TableHead>内容</TableHead>
                <TableHead className="w-0" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {dayGroups.map(group => (
                <Fragment key={group.date.toISOString()}>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableCell colSpan={4} className="font-medium">
                      <div className="flex items-center gap-3">
                        <span>{format(group.date, 'yyyy/MM/dd (E)', { locale: ja })}</span>
                        {group.totalMinutes > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {formatMinutes(group.totalMinutes)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => openAddDialog(group.date)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        追加
                      </Button>
                    </TableCell>
                  </TableRow>
                  {group.activities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-2 text-center text-xs text-muted-foreground">
                        稼働なし
                      </TableCell>
                    </TableRow>
                  ) : (
                    group.activities.map(activity => (
                      <TableRow key={activity.id}>
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
                    ))
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ActivityDialog
        mode="start"
        projectId={projectId}
        projectName={project?.name ?? ''}
        userId={userId}
        open={dialogState.open}
        onOpenChange={(open) => setDialogState(prev => ({ ...prev, open }))}
        assignments={allAssignments}
        baseDate={dialogState.baseDate}
      />
    </div>
  )
}
