'use client'

import { Formik } from 'formik'
import { useCreateActivity } from '@/hooks/api/activities'
import { useProjectConfig } from '@/hooks/api/projects'
import type { Member } from '@/api/organization/members'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FormTextarea, FormField, FormDateTimePicker } from '@/components/form'
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

import { toLocalDatetimeString } from '@/domain/date-utils'

type Props = {
  projectId: string
  assignedMembers: Member[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddActivityDialog({ projectId, assignedMembers, open, onOpenChange }: Props) {
  const { data: config } = useProjectConfig(projectId)

  const mutation = useCreateActivity()

  return (
    <Formik
      initialValues={{ userId: '', startedAt: toLocalDatetimeString(new Date()), note: '' }}
      onSubmit={(values, { resetForm }) => {
        mutation.mutate(
          {
            projectId,
            userId: values.userId,
            startedAt: new Date(values.startedAt).toISOString(),
            note: values.note || undefined,
          },
          {
            onSuccess: () => {
              toast.success('稼働を追加しました')
              onOpenChange(false)
              resetForm()
            },
            onError: () => toast.error('追加に失敗しました'),
          }
        )
      }}
    >
      {({ handleSubmit, resetForm, values, setValues }) => (
        <Dialog
          open={open}
          onOpenChange={(value) => {
            if (!value) resetForm()
            else setValues({ userId: '', startedAt: toLocalDatetimeString(new Date()), note: '' })
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
                      {assignedMembers.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>
              <FormDateTimePicker name="startedAt" label="開始日時" minuteStep={config?.roundingInterval} />
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
