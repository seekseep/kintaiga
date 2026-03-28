'use client'

import { useParams } from 'next/navigation'
import { Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useProjectMemberAssignments, useCreateProjectMember, useUpdateProjectMember, useDeleteProjectMember } from '@/hooks/api/project-members'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
import { InlineDateEditor } from '@/components/features/inline-date-editor'

function DeleteAssignmentButton({ assignmentId, projectId }: { assignmentId: string; projectId: string }) {
  const mutation = useDeleteProjectMember()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>配属を削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>配属を削除しても過去の稼働記録は削除されません。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              mutation.mutate({ id: assignmentId, projectId }, {
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

export default function ProjectUserAssignmentsPage() {
  const { id: projectId, userId } = useParams<{ id: string; userId: string }>()

  const { data: assignmentData, isLoading } = useProjectMemberAssignments({ userId, projectId })
  const assignments = assignmentData?.items ?? []

  const updateMutation = useUpdateProjectMember()
  const createMutation = useCreateProjectMember()

  async function handleSave(assignmentId: string, field: string, value: string) {
    await updateMutation.mutateAsync({
      id: assignmentId,
      [field]: value,
      projectId,
    })
  }

  function handleCreate() {
    createMutation.mutate({ projectId, userId, startedAt: new Date().toISOString() }, {
      onSuccess: () => toast.success('配属を追加しました'),
      onError: () => toast.error('追加に失敗しました'),
    })
  }

  if (isLoading) return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
      <div className="rounded-xl ring-1 ring-foreground/10 overflow-hidden">
        <div className="flex border-b">
          <div className="h-10 px-2 flex items-center"><Skeleton className="h-4 w-20" /></div>
          <div className="h-10 px-2 flex items-center"><Skeleton className="h-4 w-20" /></div>
          <div className="h-10 px-2 flex items-center"><Skeleton className="h-7 w-7" /></div>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="flex border-b last:border-0">
            <div className="h-10 px-2 flex items-center"><Skeleton className="h-4 w-24" /></div>
            <div className="h-10 px-2 flex items-center"><Skeleton className="h-4 w-24" /></div>
            <div className="h-10 px-2 flex items-center"><Skeleton className="h-7 w-7 rounded-md" /></div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={handleCreate} disabled={createMutation.isPending}>
          <Plus className="mr-1 h-4 w-4" />
          追加
        </Button>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            配属がありません
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap w-0">開始日</TableHead>
              <TableHead className="whitespace-nowrap w-0">終了日</TableHead>
              <TableHead className="w-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map(assignment => (
              <TableRow key={assignment.id}>
                <TableCell className="whitespace-nowrap">
                  <InlineDateEditor
                    value={assignment.startedAt}
                    onSave={(iso) => handleSave(assignment.id, 'startedAt', iso)}
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <InlineDateEditor
                    value={assignment.endedAt}
                    onSave={(iso) => handleSave(assignment.id, 'endedAt', iso)}
                    allowNull
                    nullLabel="未定"
                  />
                </TableCell>
                <TableCell>
                  <DeleteAssignmentButton assignmentId={assignment.id} projectId={projectId} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
