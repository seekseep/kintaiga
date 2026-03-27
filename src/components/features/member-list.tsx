'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useUpdateAssignment } from '@/hooks/api/assignments'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ActivityControl } from '@/components/activity-control'
import { AddMemberDialog } from '@/components/add-member-dialog'
import { Plus, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@/api/users'
import type { ProjectMember } from '@/schemas'

type Props = {
  projectId: string
  projectName: string
  members: ProjectMember[]
  unassignedUsers: User[]
  canManageMembers: boolean
}

export function MemberList({
  projectId,
  projectName,
  members,
  unassignedUsers,
  canManageMembers,
}: Props) {
  const [showAddMember, setShowAddMember] = useState(false)
  const [filter, setFilter] = useState<'active' | 'all'>('active')

  const endAssignmentMutation = useUpdateAssignment()

  const filteredMembers = filter === 'active'
    ? members.filter(m => m.active)
    : members

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm text-muted-foreground">メンバー</h2>
        {canManageMembers && (
          <Button variant="outline" size="sm" onClick={() => setShowAddMember(true)}>
            <Plus className="mr-1 h-4 w-4" />
            追加
          </Button>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('active')}
        >
          アクティブ
        </Button>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          すべて
        </Button>
      </div>
      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            メンバーがいません
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {filteredMembers.map(member => (
            <Card key={member.assignmentId}>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <Link href={`/projects/${projectId}/users/${member.userId}/activities`} className="flex items-center gap-3 no-underline">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.iconUrl ?? undefined} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-medium hover:underline">{member.name}</CardTitle>
                      {!member.active && (
                        <span className="text-xs text-muted-foreground">(終了)</span>
                      )}
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    {member.active && (
                      <ActivityControl
                        userId={member.userId}
                        projectId={projectId}
                        projectName={projectName}
                      />
                    )}
                    {canManageMembers && member.active && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              if (confirm(`${member.name} をメンバーから外しますか？`)) {
                                endAssignmentMutation.mutate({
                                  id: member.assignmentId,
                                  body: { endedAt: new Date().toISOString() },
                                  projectId,
                                }, {
                                  onSuccess: () => toast.success('メンバーを終了しました'),
                                  onError: () => toast.error('終了に失敗しました'),
                                })
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
          ))}
        </div>
      )}

      {canManageMembers && (
        <AddMemberDialog
          projectId={projectId}
          unassignedUsers={unassignedUsers}
          open={showAddMember}
          onOpenChange={setShowAddMember}
        />
      )}
    </section>
  )
}
