'use client'

import { Formik, useFormikContext } from 'formik'
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
import type { ProjectAssignment } from '@/schemas'

type Props = {
  projectId: string
  projectName: string
  userId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  assignments?: ProjectAssignment[]
}

function isWithinAssignments(dateStr: string, assignments: ProjectAssignment[]): boolean {
  if (assignments.length === 0) return true
  const date = new Date(dateStr)
  return assignments.some(a => {
    const start = new Date(a.startedAt)
    const end = a.endedAt ? new Date(a.endedAt) : null
    return date >= start && (end === null || date <= end)
  })
}

function AssignmentWarning({ assignments }: { assignments: ProjectAssignment[] }) {
  const { values } = useFormikContext<{ startedAt: string }>()
  if (!values.startedAt || assignments.length === 0) return null
  if (isWithinAssignments(values.startedAt, assignments)) return null
  return (
    <p className="text-sm text-destructive">
      この日時は配属期間外です
    </p>
  )
}

export function StartActivityDialog({ projectId, projectName, userId, open, onOpenChange, assignments = [] }: Props) {
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
              {assignments.length > 0 && <AssignmentWarning assignments={assignments} />}
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
