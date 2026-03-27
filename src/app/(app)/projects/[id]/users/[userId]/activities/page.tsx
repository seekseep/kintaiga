'use client'

import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useProject, useProjectConfig } from '@/hooks/api/projects'
import { useUser } from '@/hooks/api/users'
import { useActivities, useUpdateActivity, useDeleteActivity } from '@/hooks/api/activities'
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
import { ElapsedTime } from '@/components/elapsed-time'
import { InlineDateTimeEditor } from '@/components/features/inline-datetime-editor'
import { InlineTextEditor } from '@/components/features/inline-text-editor'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { useMonthOffsetSearchParam } from '@/hooks/use-month-offset-search-param'

function getMonthRange(offset: number): { start: string; end: string; label: string } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + offset
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999)
  return {
    start: start.toISOString(),
    end: end.toISOString(),
    label: `${start.getFullYear()}年${start.getMonth() + 1}月`,
  }
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

export default function ProjectUserActivitiesPage() {
  const { id: projectId, userId } = useParams<{ id: string; userId: string }>()
  const [monthOffset, setMonthOffset] = useMonthOffsetSearchParam()

  const { data: config } = useProjectConfig(projectId)

  const isMonthly = config?.aggregationUnit === 'monthly'
  const monthRange = useMemo(() => getMonthRange(monthOffset), [monthOffset])
  const minuteStep = config?.roundingInterval ?? 15
  const roundingDirection = config?.roundingDirection ?? 'ceil'

  const { data: project } = useProject(projectId)

  const { data: user } = useUser(userId)

  const { data: activitiesData, isLoading, isFetching, refetch } = useActivities(
    {
      projectId,
      userId,
      ...(isMonthly ? { startDate: monthRange.start, endDate: monthRange.end } : {}),
    },
    { enabled: config !== undefined }
  )

  const activities = activitiesData?.items ?? []

  const updateMutation = useUpdateActivity()

  async function handleSave(activityId: string, field: string, value: string) {
    await updateMutation.mutateAsync({ id: activityId, body: { [field]: value } })
  }

  if (isLoading || config === undefined) return <Skeleton className="h-64" />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-lg">{user?.name} の稼働</h1>
        <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {isMonthly && (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setMonthOffset(monthOffset - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-32 text-center">{monthRange.label}</span>
          <Button variant="ghost" size="icon" onClick={() => setMonthOffset(monthOffset + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {activities.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            稼働がありません
          </CardContent>
        </Card>
      ) : (
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
            {activities.map(activity => (
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
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
