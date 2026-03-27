'use client'

import { useState, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react'
import { useActivities } from '@/hooks/api/activities'
import { useProjectConfig } from '@/hooks/api/projects'
import { ElapsedTime } from '@/components/elapsed-time'
import { formatMinutes, formatHours } from '@/domain/time'
import { filterActivitiesByMonth, calculateTotalMinutes, getMonthRange } from '@/domain/aggregation'
import { canControlActivity } from '@/domain/authorization'
import { useAssignments } from '@/hooks/api/assignments'
import { StartActivityDialog } from '@/components/start-activity-dialog'
import { EndActivityDialog } from '@/components/end-activity-dialog'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Square, Play } from 'lucide-react'
import { format } from 'date-fns'

type Props = {
  userId: string
  projectId: string
  projectName: string
}

export type ActivityControlHandle = {
  refetch: () => void
  isFetching: boolean
}

export const ActivityControl = forwardRef<ActivityControlHandle, Props>(function ActivityControl({ userId, projectId, projectName }, ref) {
  const { user: currentUser } = useAuth()
  const canControl = currentUser ? canControlActivity(currentUser, { userId }) : false

  const [startOpen, setStartOpen] = useState(false)
  const [endOpen, setEndOpen] = useState(false)
  const [tick, setTick] = useState(0)

  const { data: config } = useProjectConfig(projectId)

  const { data: assignmentData } = useAssignments({ userId, projectId, active: true })
  const targetMinutes = assignmentData?.items[0]?.targetMinutes ?? null

  const { data: ongoingData, isFetching: isFetchingOngoing, refetch: refetchOngoing } = useActivities({ userId, projectId, ongoing: true })

  const { data: allData, isFetching: isFetchingAll, refetch: refetchAll } = useActivities({ userId, projectId })

  const isFetchingActivities = isFetchingOngoing || isFetchingAll
  const refetchActivities = () => { refetchOngoing(); refetchAll() }

  useImperativeHandle(ref, () => ({
    refetch: refetchActivities,
    isFetching: isFetchingActivities,
  }), [isFetchingActivities])

  const ongoingActivity = ongoingData?.items[0] ?? null
  const allActivities = allData?.items ?? []

  // 集計期間でフィルタ
  const periodActivities = useMemo(() => {
    if (!config) return allActivities
    return config.aggregationUnit === 'monthly'
      ? filterActivitiesByMonth(allActivities)
      : allActivities
  }, [allActivities, config])

  // 合計時間（tick で再計算トリガー）
  const totalMinutes = useMemo(() => {
    if (!config) return 0
    return calculateTotalMinutes(periodActivities, config.roundingInterval, config.roundingDirection)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodActivities, config, tick])

  // 進行中稼働がある場合、60秒ごとに合計時間を更新
  useEffect(() => {
    if (!ongoingActivity) return
    const id = setInterval(() => setTick(t => t + 1), 60000)
    return () => clearInterval(id)
  }, [ongoingActivity])

  const now = new Date()
  const isMonthly = config?.aggregationUnit === 'monthly'
  const periodDateLabel = isMonthly
    ? (() => {
        const { start, end } = getMonthRange(now)
        return `${format(start, 'yyyy/MM/dd')} → ${format(end, 'yyyy/MM/dd')}`
      })()
    : '全期間'

  const totalHours = formatHours(totalMinutes)
  const targetHours = targetMinutes != null ? formatHours(targetMinutes) : null
  const isOver = targetMinutes != null && totalMinutes > targetMinutes

  return (
    <div className="space-y-1">
      {/* 集計期間 */}
      <div className="text-xs text-muted-foreground">
        {periodDateLabel}
      </div>

      {/* ゲージ + 時間 */}
      <div className="flex items-center gap-2">
        {targetMinutes != null && targetMinutes > 0 && (
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isOver ? 'bg-destructive' : 'bg-primary'}`}
              style={{ width: `${Math.min((totalMinutes / targetMinutes) * 100, 100)}%` }}
            />
          </div>
        )}
        <div className="flex items-baseline gap-0.5 shrink-0">
          <span className={`text-sm font-semibold tabular-nums ${isOver ? 'text-destructive' : ''}`}>
            {totalHours}
          </span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm tabular-nums">{targetHours ?? '--'}</span>
          <span className="text-xs text-muted-foreground">時間</span>
        </div>
      </div>

      {/* 進行中の稼働 + 操作ボタン */}
      <div className="flex items-center gap-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {ongoingActivity && (
            <span>{format(new Date(ongoingActivity.startedAt), 'HH:mm')} ~ 現在</span>
          )}
        </div>
        {ongoingActivity && (
          <span className="text-sm font-medium tabular-nums">
            <ElapsedTime startedAt={ongoingActivity.startedAt} endedAt={null} />
          </span>
        )}
        {canControl && (
          ongoingActivity ? (
            <Button
              variant="destructive"
              size="default"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setEndOpen(true)
              }}
            >
              <Square className="mr-1 h-4 w-4" />
              終了
            </Button>
          ) : (
            <Button
              size="default"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setStartOpen(true)
              }}
            >
              <Play className="mr-1 h-4 w-4" />
              開始
            </Button>
          )
        )}
      </div>

      {canControl && (
        <>
          <StartActivityDialog
            projectId={projectId}
            projectName={projectName}
            userId={userId}
            open={startOpen}
            onOpenChange={setStartOpen}
          />

          {ongoingActivity && (
            <EndActivityDialog
              activityId={ongoingActivity.id}
              projectId={projectId}
              projectName={projectName}
              open={endOpen}
              onOpenChange={setEndOpen}
            />
          )}
        </>
      )}
    </div>
  )
})
