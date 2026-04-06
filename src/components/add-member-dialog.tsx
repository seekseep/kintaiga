'use client'

import { Formik } from 'formik'
import { useCreateProjectMember } from '@/hooks/api/project-members'
import { zodValidate } from '@/lib/form/zod-adapter'
import type { Member } from '@/api/organization/members'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/form'
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
import { DatePicker } from '@/components/ui/date-picker'
import { z } from 'zod/v4'

const schema = z.object({
  userId: z.string().min(1),
  startedAt: z.date({ message: '開始日を指定してください' }),
  endedAt: z.date().nullable(),
})

type Props = {
  projectId: string
  unassignedUsers: Member[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddMemberDialog({ projectId, unassignedUsers, open, onOpenChange }: Props) {
  const mutation = useCreateProjectMember()

  return (
    <Formik
      initialValues={{ userId: '', startedAt: new Date() as Date, endedAt: null as Date | null }}
      validate={zodValidate(schema)}
      onSubmit={(values, { resetForm }) => {
        mutation.mutate({
          projectId,
          userId: values.userId,
          startedAt: values.startedAt.toISOString(),
          endedAt: values.endedAt ? values.endedAt.toISOString() : null,
        }, {
          onSuccess: () => {
            toast.success('メンバーを追加しました')
            onOpenChange(false)
            resetForm()
          },
          onError: () => toast.error('追加に失敗しました'),
        })
      }}
    >
      {({ handleSubmit, resetForm, values, setFieldValue }) => (
        <Dialog
          open={open}
          onOpenChange={(value) => {
            if (!value) resetForm()
            onOpenChange(value)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>メンバーを追加</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {unassignedUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">追加できるユーザーがいません</p>
              ) : (
                <FormField name="userId" label="ユーザー">
                  {({ helpers }) => (
                    <Select value={values.userId} onValueChange={(v) => helpers.setValue(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="ユーザーを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {unassignedUsers.map(u => (
                          <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </FormField>
              )}
              <FormField<Date> name="startedAt" label="開始日">
                {({ helpers }) => (
                  <DatePicker
                    value={values.startedAt}
                    onValueChange={(date) => helpers.setValue(date ?? new Date())}
                    placeholder="開始日を選択"
                  />
                )}
              </FormField>
              <FormField<Date | null> name="endedAt" label="終了日">
                {({ helpers }) => (
                  <DatePicker
                    value={values.endedAt ?? undefined}
                    onValueChange={(date) => helpers.setValue(date ?? null)}
                    placeholder="指定なし"
                  />
                )}
              </FormField>
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
