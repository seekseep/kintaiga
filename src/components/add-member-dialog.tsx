'use client'

import { Formik } from 'formik'
import { useCreateAssignment } from '@/hooks/api/assignments'
import { zodValidate } from '@/lib/form/zod-adapter'
import type { User } from '@/api/users'
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
import { z } from 'zod/v4'

const schema = z.object({
  userId: z.string().min(1),
})

type Props = {
  projectId: string
  unassignedUsers: User[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddMemberDialog({ projectId, unassignedUsers, open, onOpenChange }: Props) {
  const mutation = useCreateAssignment()

  return (
    <Formik
      initialValues={{ userId: '' }}
      validate={zodValidate(schema)}
      onSubmit={(values, { resetForm }) => {
        mutation.mutate({ projectId, userId: values.userId, startedAt: new Date().toISOString() }, {
          onSuccess: () => {
            toast.success('メンバーを追加しました')
            onOpenChange(false)
            resetForm()
          },
          onError: () => toast.error('追加に失敗しました'),
        })
      }}
    >
      {({ handleSubmit, resetForm, values }) => (
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
