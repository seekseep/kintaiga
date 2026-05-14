'use client'

import { useState } from 'react'
import { Formik, useFormikContext } from 'formik'
import { BulkActivityDialog } from './bulk-activity-dialog'
import { useCreateActivity, useUpdateActivity } from '@/hooks/api/activities'
import { useProjectConfig } from '@/hooks/api/projects'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FormTextarea, FormDateTimePicker } from '@/components/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { roundDate } from '@/domain/utils/time'
import { toLocalDatetimeString } from '@/domain/utils/date'
import type { ProjectAssignment } from '@/schemas'

type BaseProps = {
  projectId: string
  projectName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

type StartMode = BaseProps & {
  mode: 'start'
  userId?: string
  assignments?: ProjectAssignment[]
  baseDate?: Date
}

type EndMode = BaseProps & {
  mode: 'end'
  activityId: string
  defaultStartedAt: string
}

type Props = StartMode | EndMode

type FormValues = {
  startedAt: string
  endedAt: string
  note: string
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
  const { values } = useFormikContext<FormValues>()
  if (!values.startedAt || assignments.length === 0) return null
  if (isWithinAssignments(values.startedAt, assignments)) return null
  return (
    <p className="text-sm text-destructive">
      この日時は配属期間外です
    </p>
  )
}

export function ActivityDialog(props: Props) {
  const { projectId, projectName, open, onOpenChange } = props
  const { data: config } = useProjectConfig(projectId)
  const [bulkOpen, setBulkOpen] = useState(false)

  const createMutation = useCreateActivity()
  const updateMutation = useUpdateActivity()

  const mutation = props.mode === 'start' ? createMutation : updateMutation

  function getInitialValues(): FormValues {
    const now = new Date()
    if (props.mode === 'start') {
      const base = props.baseDate
        ? new Date(
            props.baseDate.getFullYear(),
            props.baseDate.getMonth(),
            props.baseDate.getDate(),
            now.getHours(),
            now.getMinutes(),
            0,
          )
        : now
      const startedAt = config
        ? toLocalDatetimeString(roundDate(base, config.roundingInterval, 'floor'))
        : toLocalDatetimeString(base)
      return { startedAt, endedAt: '', note: '' }
    } else {
      const startedAt = toLocalDatetimeString(new Date(props.defaultStartedAt))
      const endedAt = config
        ? toLocalDatetimeString(roundDate(now, config.roundingInterval, 'ceil'))
        : toLocalDatetimeString(now)
      return { startedAt, endedAt, note: '' }
    }
  }

  function handleSubmit(values: FormValues, resetForm: () => void) {
    const onSuccess = () => {
      toast.success('稼働を登録しました')
      onOpenChange(false)
      resetForm()
    }
    const onError = () => {
      toast.error('登録に失敗しました')
    }

    if (props.mode === 'start') {
      createMutation.mutate(
        {
          projectId,
          userId: props.userId,
          startedAt: new Date(values.startedAt).toISOString(),
          endedAt: values.endedAt ? new Date(values.endedAt).toISOString() : undefined,
          note: values.note || undefined,
        },
        { onSuccess, onError }
      )
    } else {
      updateMutation.mutate(
        {
          id: props.activityId,
          startedAt: new Date(values.startedAt).toISOString(),
          endedAt: values.endedAt ? new Date(values.endedAt).toISOString() : undefined,
          note: values.note || undefined,
        },
        { onSuccess, onError }
      )
    }
  }

  const assignments = props.mode === 'start' ? (props.assignments ?? []) : []

  const formikTree = (
    <Formik
      initialValues={getInitialValues()}
      enableReinitialize
      onSubmit={(values, { resetForm }) => handleSubmit(values, resetForm)}
    >
      {({ handleSubmit: formikSubmit, resetForm, setValues }) => (
        <Dialog
          open={open}
          onOpenChange={(value) => {
            if (!value) resetForm()
            else setValues(getInitialValues())
            onOpenChange(value)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>稼働を登録</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>プロジェクト名</Label>
                <Input value={projectName} readOnly disabled />
              </div>
              <FormDateTimePicker name="startedAt" label="開始日時" minuteStep={config?.roundingInterval} />
              {assignments.length > 0 && <AssignmentWarning assignments={assignments} />}
              <FormDateTimePicker name="endedAt" label="終了日時" minuteStep={config?.roundingInterval} />
              <FormTextarea name="note" label="内容" autoFocus />
            </div>
            <DialogFooter>
              {props.mode === 'start' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false)
                    setBulkOpen(true)
                  }}
                >
                  一括登録
                </Button>
              )}
              <Button onClick={() => formikSubmit()} disabled={mutation.isPending}>
                {mutation.isPending ? '登録中...' : '登録'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Formik>
  )

  if (props.mode !== 'start') return formikTree

  return (
    <>
      {formikTree}
      <BulkActivityDialog
        projectId={projectId}
        projectName={projectName}
        userId={props.userId}
        open={bulkOpen}
        onOpenChange={setBulkOpen}
      />
    </>
  )
}
