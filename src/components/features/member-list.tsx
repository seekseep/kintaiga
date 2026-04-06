'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ActivityControl, type ActivityControlHandle } from '@/components/activity-control'
import { AddMemberDialog } from '@/components/add-member-dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, RefreshCw } from 'lucide-react'
import type { Member } from '@/api/organization/members'
import type { ProjectMember } from '@/schemas'

type Props = {
  projectId: string
  projectName: string
  members: ProjectMember[]
  unassignedUsers: Member[]
  canManageMembers: boolean
}

function MemberCard({
  member,
  projectId,
  projectName,
}: {
  member: ProjectMember
  projectId: string
  projectName: string
}) {
  const activityRef = useRef<ActivityControlHandle>(null)
  const [isFetching, setIsFetching] = useState(false)

  const handleRefetch = useCallback(() => {
    activityRef.current?.refetch()
    setIsFetching(true)
    setTimeout(() => setIsFetching(false), 1000)
  }, [])

  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <Link href={`/projects/${projectId}/members/${member.userId}/activities`} className="flex items-center gap-3 no-underline">
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
          <div className="flex items-center gap-1">
            {member.active && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRefetch() }}
                disabled={isFetching}
              >
                <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>
        {member.active && (
          <ActivityControl
            ref={activityRef}
            userId={member.userId}
            projectId={projectId}
            projectName={projectName}
          />
        )}
      </CardHeader>
    </Card>
  )
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

  const activeMembers = members.filter(m => m.active)
  const filteredMembers = filter === 'active'
    ? activeMembers
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
      <Tabs value={filter} onValueChange={(v) => setFilter(v as 'active' | 'all')}>
        <TabsList>
          <TabsTrigger value="active">アクティブ（{activeMembers.length}）</TabsTrigger>
          <TabsTrigger value="all">すべて（{members.length}）</TabsTrigger>
        </TabsList>
      </Tabs>
      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            メンバーがいません
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))' }}>
          {filteredMembers.map(member => (
            <MemberCard
              key={member.projectAssignmentId}
              member={member}
              projectId={projectId}
              projectName={projectName}
            />
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
