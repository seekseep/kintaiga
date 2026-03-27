'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Formik } from 'formik'
import { updateActivity } from '@/api/activities'
import { getProjectConfig } from '@/api/projects'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FormInput, FormTextarea } from '@/components/form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

function roundDate(date: Date, interval: number, direction: 'ceil' | 'floor'): Date {
  if (interval <= 0) return date
  const ms = interval * 60 * 1000
  const rounded = direction === 'floor'
    ? Math.floor(date.getTime() / ms) * ms
    : Math.ceil(date.getTime() / ms) * ms
  return new Date(rounded)
}

function toLocalDatetime(date: Date) {
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

type Props = {
  activityId: string
  projectId: string
  projectName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EndActivityDialog({ activityId, projectId, projectName, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()

  const { data: config } = useQuery({
    queryKey: ['projects', projectId, 'config'],
    queryFn: () => getProjectConfig(projectId),
  })

  function getRoundedNow() {
    const now = new Date()
    if (!config) return toLocalDatetime(now)
    return toLocalDatetime(roundDate(now, config.roundingInterval, 'ceil'))
  }

  const mutation = useMutation({
    mutationFn: (values: { endedAt: string; note: string }) =>
      updateActivity(activityId, {
        endedAt: new Date(values.endedAt).toISOString(),
        note: values.note || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast.success('稼働を終了しました')
      onOpenChange(false)
    },
    onError: () => toast.error('終了に失敗しました'),
  })

  return (
    <Formik
      initialValues={{ endedAt: getRoundedNow(), note: '' }}
      onSubmit={(values, { resetForm }) => {
        mutation.mutate(values, { onSuccess: () => resetForm() })
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
              <FormInput name="endedAt" label="終了日時" type="datetime-local" />
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
