'use client'

import { Formik } from 'formik'
import { useUpdateActivity } from '@/hooks/api/activities'
import { useProjectConfig } from '@/hooks/api/projects'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FormTextarea, FormDateTimePicker } from '@/components/form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

import { roundDate } from '@/domain/time'
import { toLocalDatetimeString } from '@/domain/date-utils'

type Props = {
  activityId: string
  projectId: string
  projectName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EndActivityDialog({ activityId, projectId, projectName, open, onOpenChange }: Props) {
  const { data: config } = useProjectConfig(projectId)

  function getRoundedNow() {
    const now = new Date()
    if (!config) return toLocalDatetimeString(now)
    return toLocalDatetimeString(roundDate(now, config.roundingInterval, 'ceil'))
  }

  const mutation = useUpdateActivity()

  return (
    <Formik
      initialValues={{ endedAt: getRoundedNow(), note: '' }}
      onSubmit={(values, { resetForm }) => {
        mutation.mutate(
          {
            id: activityId,
            body: {
              endedAt: new Date(values.endedAt).toISOString(),
              note: values.note || undefined,
            },
          },
          {
            onSuccess: () => {
              toast.success('稼働を終了しました')
              onOpenChange(false)
              resetForm()
            },
            onError: () => toast.error('終了に失敗しました'),
          }
        )
      }}
    >
      {({ handleSubmit, resetForm, setValues }) => (
        <Dialog
          open={open}
          onOpenChange={(value) => {
            if (!value) resetForm()
            else setValues({ endedAt: getRoundedNow(), note: '' })
            onOpenChange(value)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{projectName} — 終了</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <FormDateTimePicker name="endedAt" label="終了日時" minuteStep={config?.roundingInterval} />
              <FormTextarea name="note" label="メモ（任意）" />
            </div>
            <DialogFooter>
              <Button onClick={() => handleSubmit()} disabled={mutation.isPending}>
                {mutation.isPending ? '終了中...' : '終了'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Formik>
  )
}
