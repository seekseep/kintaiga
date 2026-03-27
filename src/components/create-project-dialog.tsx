'use client'

import { Formik } from 'formik'
import { useCreateProject } from '@/hooks/api/projects'
import { CreateProjectParametersSchema } from '@db/validation'
import { zodValidate } from '@/lib/form/zod-adapter'
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

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectDialog({ open, onOpenChange }: Props) {
  const mutation = useCreateProject()

  return (
    <Formik
      initialValues={{ name: '', description: '' }}
      validate={zodValidate(CreateProjectParametersSchema)}
      onSubmit={(values, { resetForm }) => {
        mutation.mutate(
          { name: values.name, description: values.description || undefined },
          {
            onSuccess: () => {
              toast.success('プロジェクトを追加しました')
              onOpenChange(false)
              resetForm()
            },
            onError: () => toast.error('プロジェクトの追加に失敗しました'),
          }
        )
      }}
    >
      {({ handleSubmit, resetForm, dirty, isValid }) => (
        <Dialog
          open={open}
          onOpenChange={(value) => {
            if (!value) resetForm()
            onOpenChange(value)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>プロジェクトを追加</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <FormInput name="name" label="プロジェクト名" placeholder="プロジェクト名を入力" />
              <FormTextarea name="description" label="説明（任意）" placeholder="プロジェクトの説明を入力" />
            </div>
            <DialogFooter>
              <Button
                onClick={() => handleSubmit()}
                disabled={mutation.isPending || !dirty || !isValid}
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
