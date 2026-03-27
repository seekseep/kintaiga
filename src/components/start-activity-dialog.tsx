'use client'

import { Formik } from 'formik'
import { useCreateActivity } from '@/hooks/api/activities'
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
  projectId: string
  projectName: string
  userId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StartActivityDialog({ projectId, projectName, userId, open, onOpenChange }: Props) {
  const { data: config } = useProjectConfig(projectId)

  function getRoundedNow() {
    const now = new Date()
    if (!config) return toLocalDatetimeString(now)
    return toLocalDatetimeString(roundDate(now, config.roundingInterval, 'floor'))
  }

  const mutation = useCreateActivity()

  return (
    <Formik
      initialValues={{ startedAt: getRoundedNow(), note: '' }}
      onSubmit={(values, { resetForm }) => {
        mutation.mutate(
          {
            projectId,
            userId,
            startedAt: new Date(values.startedAt).toISOString(),
            note: values.note || undefined,
          },
          {
            onSuccess: () => {
              toast.success('稼働を開始しました')
              onOpenChange(false)
              resetForm()
            },
            onError: () => toast.error('開始に失敗しました'),
          }
        )
      }}
    >
      {({ handleSubmit, resetForm, setValues }) => (
        <Dialog
          open={open}
          onOpenChange={(value) => {
            if (!value) resetForm()
            else setValues({ startedAt: getRoundedNow(), note: '' })
            onOpenChange(value)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{projectName} — 開始</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <FormDateTimePicker name="startedAt" label="開始日時" minuteStep={config?.roundingInterval} />
              <FormTextarea name="note" label="メモ（任意）" />
            </div>
            <DialogFooter>
              <Button onClick={() => handleSubmit()} disabled={mutation.isPending}>
                {mutation.isPending ? '開始中...' : '開始'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Formik>
  )
}
