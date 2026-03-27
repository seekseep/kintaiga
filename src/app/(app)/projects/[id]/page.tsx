'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'
import { getProject } from '@/api/projects'
import { getAssignments, updateAssignment } from '@/api/assignments'
import { getUsers } from '@/api/users'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AddMemberDialog } from '@/components/add-member-dialog'
import { ActivityControl } from '@/components/activity-control'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'admin'
  const queryClient = useQueryClient()

  const [showAddMember, setShowAddMember] = useState(false)

  const { data: project } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => getProject(id),
  })

  const { data: assignmentsData, isLoading: loadingAssignments } = useQuery({
    queryKey: ['projects', id, 'assignments'],
    queryFn: () => getAssignments({ projectId: id, active: true }),
  })

  const { data: allUsersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  })

  const endAssignmentMutation = useMutation({
    mutationFn: (assignmentId: string) => updateAssignment(assignmentId, {
      endedAt: new Date().toISOString(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', id, 'assignments'] })
      toast.success('メンバーを終了しました')
    },
    onError: () => toast.error('終了に失敗しました'),
  })

  const assignments = assignmentsData?.items ?? []
  const allUsers = allUsersData?.items ?? []

  const assignedUserIds = new Set(assignments.map(a => a.userId))
  const assignedUsers = allUsers
    .filter(u => assignedUserIds.has(u.id))
    .sort((a, b) => {
      if (a.id === currentUser?.id) return -1
      if (b.id === currentUser?.id) return 1
      return 0
    })
  const unassignedUsers = allUsers.filter(u => !assignedUserIds.has(u.id))

  // assignment を userId で引く
  const assignmentByUser = new Map(assignments.map(a => [a.userId, a]))

  const loading = loadingAssignments || loadingUsers

  if (loading) return <Skeleton className="h-64" />

  return (
    <div className="space-y-6">
      {/* メンバー一覧 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-muted-foreground">メンバー</h2>
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => setShowAddMember(true)}>
              <Plus className="mr-1 h-4 w-4" />
              追加
            </Button>
          )}
        </div>
        {assignedUsers.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground">
              メンバーがいません
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-2">
            {assignedUsers.map(u => {
              const assignment = assignmentByUser.get(u.id)
              return (
                <Link key={u.id} href={`/projects/${id}/users/${u.id}/activities`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.iconUrl ?? undefined} />
                          <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-sm font-medium">{u.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        {project && (
                          <ActivityControl
                            userId={u.id}
                            projectId={id}
                            projectName={project.name}
                          />
                        )}
                        {isAdmin && assignment && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => { e.preventDefault(); e.stopPropagation() }}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => { e.preventDefault(); e.stopPropagation() }}>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  if (confirm(`${u.name} をメンバーから外しますか？`)) {
                                    endAssignmentMutation.mutate(assignment.id)
                                  }
                                }}
                              >
                                プロジェクトから削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {isAdmin && (
        <AddMemberDialog
          projectId={id}
          unassignedUsers={unassignedUsers}
          open={showAddMember}
          onOpenChange={setShowAddMember}
        />
      )}
    </div>
  )
}
