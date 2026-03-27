'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Formik } from 'formik'
import { createActivity } from '@/api/activities'
import type { User } from '@/api/users'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FormInput, FormTextarea, FormField } from '@/components/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

function toLocalDatetime(date: Date) {
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

type Props = {
  projectId: string
  assignedUsers: User[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddActivityDialog({ projectId, assignedUsers, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (values: { userId: string; startedAt: string; note: string }) =>
      createActivity({
        projectId,
        userId: values.userId,
        startedAt: new Date(values.startedAt).toISOString(),
        note: values.note || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast.success('稼働を追加しました')
      onOpenChange(false)
    },
    onError: () => toast.error('追加に失敗しました'),
  })

  return (
    <Formik
      initialValues={{ userId: '', startedAt: toLocalDatetime(new Date()), note: '' }}
      onSubmit={(values, { resetForm }) => {
        mutation.mutate(values, { onSuccess: () => resetForm() })
      }}
    >
      {({ handleSubmit, resetForm, values, setValues }) => (
        <Dialog
          open={open}
          onOpenChange={(value) => {
            if (!value) resetForm()
            else setValues({ userId: '', startedAt: toLocalDatetime(new Date()), note: '' })
            onOpenChange(value)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>稼働を追加</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <FormField name="userId" label="ユーザー">
                {({ helpers }) => (
                  <Select value={values.userId} onValueChange={(v) => helpers.setValue(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="ユーザーを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignedUsers.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>
              <FormInput name="startedAt" label="開始日時" type="datetime-local" />
              <FormTextarea name="note" label="メモ（任意）" />
            </div>
            <DialogFooter>
              <Button
                onClick={() => handleSubmit()}
                disabled={!values.userId || mutation.isPending}
              >
                {mutation.isPending ? '追加中...' : '追加'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Formik>
  )
}
