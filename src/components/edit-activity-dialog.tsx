'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Formik } from 'formik'
import { updateActivity, deleteActivity, type Activity } from '@/api/activities'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormInput, FormTextarea } from '@/components/form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

function toLocalDatetime(iso: string) {
  const d = new Date(iso)
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

type Props = {
  activity: Activity
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditActivityDialog({ activity, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()

  const saveMutation = useMutation({
    mutationFn: (values: { endedAt: string; note: string }) =>
      updateActivity(activity.id, {
        endedAt: values.endedAt ? new Date(values.endedAt).toISOString() : null,
        note: values.note || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast.success('更新しました')
      onOpenChange(false)
    },
    onError: () => toast.error('更新に失敗しました'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteActivity(activity.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast.success('削除しました')
      onOpenChange(false)
    },
    onError: () => toast.error('削除に失敗しました'),
  })

  return (
    <Formik
      enableReinitialize
      initialValues={{
        endedAt: activity.endedAt ? toLocalDatetime(activity.endedAt) : '',
        note: activity.note ?? '',
      }}
      onSubmit={(values) => saveMutation.mutate(values)}
    >
      {({ handleSubmit }) => (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>稼働編集</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>開始日時</Label>
                <Input type="datetime-local" value={toLocalDatetime(activity.startedAt)} disabled />
              </div>
              <FormInput name="endedAt" label="終了日時" type="datetime-local" />
              <FormTextarea name="note" label="メモ" />
            </div>
            <DialogFooter className="flex justify-between">
              <Button variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
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
