'use client'

import { useState, useEffect, useMemo } from 'react'
import { useActivities } from '@/hooks/api/activities'
import { useProjectConfig } from '@/hooks/api/projects'
import { ElapsedTime } from '@/components/elapsed-time'
import { formatMinutes } from '@/domain/time'
import { filterActivitiesByMonth, calculateTotalMinutes } from '@/domain/aggregation'
import { canControlActivity } from '@/domain/authorization'
import { useAssignments } from '@/hooks/api/assignments'
import { StartActivityDialog } from '@/components/start-activity-dialog'
import { EndActivityDialog } from '@/components/end-activity-dialog'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Square, Play, RefreshCw } from 'lucide-react'

type Props = {
  userId: string
  projectId: string
  projectName: string
}

export function ActivityControl({ userId, projectId, projectName }: Props) {
  const { user: currentUser } = useAuth()
  const canControl = currentUser ? canControlActivity(currentUser.role, currentUser.id, userId) : false

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

  const periodLabel = config?.aggregationUnit === 'monthly'
    ? `${new Date().getMonth() + 1}月`
    : '全期間'

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          {periodLabel} {formatMinutes(totalMinutes)}
          {' / '}
          {targetMinutes != null ? formatMinutes(targetMinutes) : '--'}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); refetchActivities() }}
          disabled={isFetchingActivities}
        >
          <RefreshCw className={`h-3 w-3 ${isFetchingActivities ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {ongoingActivity && (
          <span className="text-sm text-foreground font-medium">
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
}
