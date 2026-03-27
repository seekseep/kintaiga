'use client'

import { Formik } from 'formik'
import { useUpdateActivity, useDeleteActivity } from '@/hooks/api/activities'
import { useProjectConfig } from '@/hooks/api/projects'
import type { Activity } from '@/api/activities'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FormTextarea, FormDateTimePicker } from '@/components/form'
import { formatElapsed } from '@/components/elapsed-time'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

import { roundDate } from '@/domain/time'
import { toLocalDatetimeString, isoToLocalDatetimeString } from '@/domain/date-utils'
import { validateActivityDates } from '@/domain/activity-rules'


function nowRounded(interval: number, direction: 'ceil' | 'floor') {
  return toLocalDatetimeString(roundDate(new Date(), interval, direction))
}

type Props = {
  activity: Activity
  open: boolean
  onOpenChange: (open: boolean) => void
}

function TimeAdjustButtons({
  interval,
  onAdjust,
  onSetNow,
}: {
  interval: number
  onAdjust: (minutes: number) => void
  onSetNow: () => void
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={() => onAdjust(-interval)}
      >
        -{interval}分
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={() => onAdjust(interval)}
      >
        +{interval}分
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={onSetNow}
      >
        現在
      </Button>
    </div>
  )
}

export function EditActivityDialog({ activity, open, onOpenChange }: Props) {
  const { data: config } = useProjectConfig(activity.projectId)

  const interval = config?.roundingInterval ?? 15
  const direction = config?.roundingDirection ?? 'ceil'

  const saveMutation = useUpdateActivity()
  const deleteMutation = useDeleteActivity()

  return (
    <Formik
      enableReinitialize
      initialValues={{
        startedAt: isoToLocalDatetimeString(activity.startedAt),
        endedAt: activity.endedAt ? isoToLocalDatetimeString(activity.endedAt) : '',
        note: activity.note ?? '',
      }}
      validate={(values) => {
        const errors: Record<string, string> = {}
        if (values.startedAt && values.endedAt) {
          const result = validateActivityDates(new Date(values.startedAt), new Date(values.endedAt))
          if (!result.valid) errors.endedAt = result.error!
        }
        return errors
      }}
      onSubmit={(values) =>
        saveMutation.mutate(
          {
            id: activity.id,
            body: {
              startedAt: new Date(values.startedAt).toISOString(),
              endedAt: values.endedAt ? new Date(values.endedAt).toISOString() : null,
              note: values.note || undefined,
            },
          },
          {
            onSuccess: () => {
              toast.success('更新しました')
              onOpenChange(false)
            },
            onError: () => toast.error('更新に失敗しました'),
          }
        )
      }
    >
      {({ handleSubmit, values, setFieldValue }) => (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>稼働編集</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>開始日時</Label>
                  <TimeAdjustButtons
                    interval={interval}
                    onAdjust={(minutes) => {
                      const d = new Date(values.startedAt)
                      d.setMinutes(d.getMinutes() + minutes)
                      setFieldValue('startedAt', isoToLocalDatetimeString(d.toISOString()))
                    }}
                    onSetNow={() => setFieldValue('startedAt', nowRounded(interval, direction))}
                  />
                </div>
                <FormDateTimePicker name="startedAt" minuteStep={interval} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>終了日時</Label>
                  <TimeAdjustButtons
                    interval={interval}
                    onAdjust={(minutes) => {
                      const current = values.endedAt || nowRounded(interval, direction)
                      const d = new Date(current)
                      d.setMinutes(d.getMinutes() + minutes)
                      setFieldValue('endedAt', isoToLocalDatetimeString(d.toISOString()))
                    }}
                    onSetNow={() => setFieldValue('endedAt', nowRounded(interval, direction))}
                  />
                </div>
                <FormDateTimePicker name="endedAt" minuteStep={interval} />
              </div>
              {values.startedAt && (
                <div className="text-sm text-muted-foreground">
                  経過時間: {formatElapsed(
                    new Date(values.startedAt).toISOString(),
                    values.endedAt ? new Date(values.endedAt).toISOString() : null
                  )}
                </div>
              )}
              <FormTextarea name="note" label="メモ" />
            </div>
            <DialogFooter className="flex justify-between">
              <Button
                variant="destructive"
                onClick={() =>
                  deleteMutation.mutate(activity.id, {
                    onSuccess: () => {
                      toast.success('削除しました')
                      onOpenChange(false)
                    },
                    onError: () => toast.error('削除に失敗しました'),
                  })
                }
                disabled={deleteMutation.isPending}
              >
                削除
              </Button>
              <Button onClick={() => handleSubmit()} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? '保存中...' : '保存'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Formik>
  )
}
