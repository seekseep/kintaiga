'use client'

import { useMemo } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
import { Card, CardContent } from '@/components/ui/card'
import { ElapsedTime, calcElapsedMinutes } from '@/components/elapsed-time'
import { InlineDateTimeEditor } from '@/components/features/inline-datetime-editor'
import { InlineTextEditor } from '@/components/features/inline-text-editor'
import { useUpdateActivity, useDeleteActivity } from '@/hooks/api/activities'
import type { ProjectActivity as Activity } from '@/api/activities'

type Props = {
  activities: Activity[]
  showUserColumn: boolean
  minuteStep?: number
  roundingDirection?: 'ceil' | 'floor'
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

export function ActivityTable({ activities, showUserColumn, minuteStep = 15, roundingDirection = 'ceil' }: Props) {
  const colCount = (showUserColumn ? 6 : 5) + 1 // +1 for delete column

  const updateMutation = useUpdateActivity()

  const totalMinutes = useMemo(() =>
    activities.reduce((sum, a) => sum + calcElapsedMinutes(a.startedAt, a.endedAt), 0),
    [activities]
  )
  const totalHours = Math.floor(totalMinutes / 60)
  const totalMins = totalMinutes % 60
  const totalDisplay = totalHours > 0 ? `${totalHours}時間${totalMins}分` : `${totalMins}分`

  async function handleSave(activityId: string, field: string, value: string) {
    await updateMutation.mutateAsync({ id: activityId, body: { [field]: value } })
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground">
          稼働がありません
        </CardContent>
      </Card>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {showUserColumn && <TableHead>ユーザー</TableHead>}
          <TableHead>プロジェクト</TableHead>
          <TableHead className="w-44">開始</TableHead>
          <TableHead className="w-44">終了</TableHead>
          <TableHead>経過時間</TableHead>
          <TableHead>メモ</TableHead>
          <TableHead className="w-0" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities.map(activity => (
          <TableRow key={activity.id}>
            {showUserColumn && <TableCell>{activity.userName ?? '-'}</TableCell>}
            <TableCell>{activity.projectName ?? '-'}</TableCell>
            <TableCell>
              <InlineDateTimeEditor
                value={activity.startedAt}
                onSave={(iso) => handleSave(activity.id, 'startedAt', iso)}
                minuteStep={minuteStep}
                roundingDirection={roundingDirection}
              />
            </TableCell>
            <TableCell>
              <InlineDateTimeEditor
                value={activity.endedAt}
                onSave={(iso) => handleSave(activity.id, 'endedAt', iso)}
                allowNull
                nullLabel="進行中"
                minuteStep={minuteStep}
                roundingDirection={roundingDirection}
              />
            </TableCell>
            <TableCell><ElapsedTime startedAt={activity.startedAt} endedAt={activity.endedAt} /></TableCell>
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
      <TableFooter>
        <TableRow>
          <TableCell colSpan={colCount - 2} className="text-right font-medium">合計</TableCell>
          <TableCell className="font-medium">{totalDisplay}</TableCell>
          <TableCell />
        </TableRow>
      </TableFooter>
    </Table>
  )
}
