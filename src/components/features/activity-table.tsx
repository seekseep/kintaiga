'use client'

import { useCallback, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ElapsedTime, calcElapsedMinutes } from '@/components/elapsed-time'
import { InlineDateTimeEditor } from '@/components/features/inline-datetime-editor'
import { InlineTextEditor } from '@/components/features/inline-text-editor'
import { ActivityCommandBar } from '@/components/features/activity-command-bar'
import { useUpdateActivity, useDeleteActivity } from '@/hooks/api/activities'
import type { ProjectActivity as Activity } from '@/api/activities'

type ActivityPreview = {
  startedAt: string
  endedAt: string | null
}

type Props = {
  activities: Activity[]
  showUserColumn: boolean
  minuteStep?: number
  roundingDirection?: 'ceil' | 'floor'
}

function DeleteButton({ activityId }: { activityId: string }) {
  const mutation = useDeleteActivity()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>稼働を削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>この操作は元に戻せません。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              mutation.mutate(activityId, {
                onSuccess: () => toast.success('削除しました'),
                onError: () => toast.error('削除に失敗しました'),
              })
            }
            disabled={mutation.isPending}
          >
            削除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function formatDateTimePreview(iso: string): string {
  return format(new Date(iso), 'yyyy/MM/dd(E) HH:mm', { locale: ja })
}

export function ActivityTable({ activities, showUserColumn, minuteStep = 15, roundingDirection = 'ceil' }: Props) {
  const updateMutation = useUpdateActivity()
  const [commandPreview, setCommandPreview] = useState<Map<string, ActivityPreview> | null>(null)

  const handleCommandPreview = useCallback((preview: Map<string, ActivityPreview> | null) => {
    setCommandPreview(preview)
  }, [])

  async function handleSave(activityId: string, field: string, value: string) {
    await updateMutation.mutateAsync({ id: activityId, body: { [field]: value } })
  }

  const columns = useMemo<ColumnDef<Activity>[]>(() => {
    const cols: ColumnDef<Activity>[] = [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="すべて選択"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="行を選択"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ]

    if (showUserColumn) {
      cols.push({
        id: 'userName',
        header: 'ユーザー',
        cell: ({ row }) => row.original.userName ?? '-',
      })
    }

    cols.push(
      {
        id: 'projectName',
        header: 'プロジェクト',
        cell: ({ row }) => row.original.projectName ?? '-',
      },
      {
        id: 'startedAt',
        header: '開始',
        meta: { className: 'w-44' },
        cell: ({ row }) => (
          <InlineDateTimeEditor
            value={row.original.startedAt}
            onSave={(iso) => handleSave(row.original.id, 'startedAt', iso)}
            minuteStep={minuteStep}
            roundingDirection={roundingDirection}
          />
        ),
      },
      {
        id: 'endedAt',
        header: '終了',
        meta: { className: 'w-44' },
        cell: ({ row }) => (
          <InlineDateTimeEditor
            value={row.original.endedAt}
            onSave={(iso) => handleSave(row.original.id, 'endedAt', iso)}
            allowNull
            nullLabel="進行中"
            minuteStep={minuteStep}
            roundingDirection={roundingDirection}
          />
        ),
      },
      {
        id: 'elapsed',
        header: '経過時間',
        cell: ({ row }) => <ElapsedTime startedAt={row.original.startedAt} endedAt={row.original.endedAt} />,
      },
      {
        id: 'note',
        header: 'メモ',
        cell: ({ row }) => (
          <InlineTextEditor
            value={row.original.note}
            onSave={(text) => handleSave(row.original.id, 'note', text)}
          />
        ),
      },
      {
        id: 'actions',
        header: '',
        meta: { className: 'w-0' },
        cell: ({ row }) => <DeleteButton activityId={row.original.id} />,
      },
    )

    return cols
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showUserColumn, minuteStep, roundingDirection])

  const table = useReactTable({
    data: activities,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  })

  const selectedIds = Object.keys(table.getState().rowSelection)

  const totalMinutes = useMemo(() =>
    activities.reduce((sum, a) => sum + calcElapsedMinutes(a.startedAt, a.endedAt), 0),
    [activities]
  )
  const totalHours = Math.floor(totalMinutes / 60)
  const totalMins = totalMinutes % 60
  const totalDisplay = totalHours > 0 ? `${totalHours}時間${totalMins}分` : `${totalMins}分`

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground">
          稼働がありません
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {selectedIds.length > 0 && (
        <ActivityCommandBar
          selectedIds={selectedIds}
          activities={activities}
          onClearSelection={() => {
            table.resetRowSelection()
            setCommandPreview(null)
          }}
          onCommandPreview={handleCommandPreview}
        />
      )}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={(header.column.columnDef.meta as { className?: string })?.className}
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => {
            const preview = commandPreview?.get(row.id)
            return (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className={preview ? 'bg-blue-50' : undefined}
              >
                {row.getVisibleCells().map((cell) => {
                  if (preview && cell.column.id === 'startedAt') {
                    return (
                      <TableCell key={cell.id}>
                        <span className="text-sm text-blue-700 font-medium">
                          {formatDateTimePreview(preview.startedAt)}
                        </span>
                      </TableCell>
                    )
                  }
                  if (preview && cell.column.id === 'endedAt') {
                    return (
                      <TableCell key={cell.id}>
                        <span className="text-sm text-blue-700 font-medium">
                          {preview.endedAt ? formatDateTimePreview(preview.endedAt) : '進行中'}
                        </span>
                      </TableCell>
                    )
                  }
                  return (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={columns.length - 2} className="text-right font-medium">合計</TableCell>
            <TableCell className="font-medium">{totalDisplay}</TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
