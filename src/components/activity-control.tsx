'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getActivities, type Activity } from '@/api/activities'
import { getProjectConfig } from '@/api/projects'
import { calcElapsedMinutes, ElapsedTime } from '@/components/elapsed-time'
import { StartActivityDialog } from '@/components/start-activity-dialog'
import { EndActivityDialog } from '@/components/end-activity-dialog'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Square, Play } from 'lucide-react'

function roundMinutes(minutes: number, interval: number, direction: 'ceil' | 'floor'): number {
  if (interval <= 0) return minutes
  return direction === 'ceil'
    ? Math.ceil(minutes / interval) * interval
    : Math.floor(minutes / interval) * interval
}

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) return `${h}時間${m}分`
  return `${m}分`
}

function getMonthRange(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

function filterByMonth(activities: Activity[]): Activity[] {
  const { start, end } = getMonthRange()
  return activities.filter(a => {
    const d = new Date(a.startedAt)
    return d >= start && d <= end
  })
}

type Props = {
  userId: string
  projectId: string
  projectName: string
}

export function ActivityControl({ userId, projectId, projectName }: Props) {
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'admin'
  const canControl = isAdmin || currentUser?.id === userId

  const [startOpen, setStartOpen] = useState(false)
  const [endOpen, setEndOpen] = useState(false)
  const [tick, setTick] = useState(0)

  const { data: config } = useQuery({
    queryKey: ['projects', projectId, 'config'],
    queryFn: () => getProjectConfig(projectId),
  })

  const { data: ongoingData } = useQuery({
    queryKey: ['activities', { userId, projectId, ongoing: true }],
    queryFn: () => getActivities({ userId, projectId, ongoing: true, limit: 1 }),
  })

  const { data: allData } = useQuery({
    queryKey: ['activities', { userId, projectId }],
    queryFn: () => getActivities({ userId, projectId, limit: 200 }),
  })

  const ongoingActivity = ongoingData?.items[0] ?? null
  const allActivities = allData?.items ?? []

  // 集計期間でフィルタ
  const periodActivities = useMemo(() => {
    if (!config) return allActivities
    return config.aggregationUnit === 'monthly'
      ? filterByMonth(allActivities)
      : allActivities
  }, [allActivities, config])

  // 合計時間（tick で再計算トリガー）
  const totalMinutes = useMemo(() => {
    if (!config) return 0
    return periodActivities.reduce((sum, a) => {
      const raw = calcElapsedMinutes(a.startedAt, a.endedAt)
      return sum + roundMinutes(raw, config.roundingInterval, config.roundingDirection)
    }, 0)
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
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{periodLabel}: {formatMinutes(totalMinutes)}</span>
        {ongoingActivity && (
          <span className="text-foreground font-medium">
            (稼働中 <ElapsedTime startedAt={ongoingActivity.startedAt} endedAt={null} />)
          </span>
        )}
      </div>

      {canControl && (
        ongoingActivity ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setEndOpen(true)
            }}
          >
            <Square className="mr-1 h-3 w-3" />
            終了
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setStartOpen(true)
            }}
          >
            <Play className="mr-1 h-3 w-3" />
            開始
          </Button>
        )
      )}

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
