'use client'

import { useParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useProject, useProjectMembers } from '@/hooks/api/projects'
import { useUsers } from '@/hooks/api/users'
import { Skeleton } from '@/components/ui/skeleton'
import { MemberList } from '@/components/features/member-list'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'admin'

  const { data: project } = useProject(id)

  const { data: membersData, isLoading: loadingMembers } = useProjectMembers(id)

  const { data: allUsersData, isLoading: loadingUsers } = useUsers()

  const members = membersData?.items ?? []
  const allUsers = allUsersData?.items ?? []

  const assignedUserIds = new Set(members.map(m => m.userId))
  const sortedMembers = [...members].sort((a, b) => {
    if (a.userId === currentUser?.id) return -1
    if (b.userId === currentUser?.id) return 1
    return 0
  })
  const unassignedUsers = allUsers.filter(u => !assignedUserIds.has(u.id))

  const loading = loadingMembers || loadingUsers

  if (loading) return <Skeleton className="h-64" />

  return (
    <div className="space-y-6">
      {project && (
        <MemberList
          projectId={id}
          projectName={project.name}
          members={sortedMembers}
          unassignedUsers={unassignedUsers}
          canManageMembers={isAdmin}
        />
      )}
    </div>
  )
}
