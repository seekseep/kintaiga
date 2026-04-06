'use client'

import { useParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useOrganization } from '@/contexts/organization-context'
import { useProject, useProjectMembers } from '@/hooks/api/projects'
import { useMembers } from '@/hooks/api/members'
import { Skeleton } from '@/components/ui/skeleton'
import { MemberList } from '@/components/features/member-list'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user: currentUser } = useAuth()
  const { role: organizationRole } = useOrganization()
  const isAdmin = organizationRole === 'owner' || organizationRole === 'manager'

  const { data: project } = useProject(id)

  const { data: membersData, isLoading: loadingMembers } = useProjectMembers(id)

  const { data: allMembersData, isLoading: loadingAllMembers } = useMembers()

  const members = membersData?.items ?? []
  const allMembers = allMembersData?.items ?? []

  const assignedUserIds = new Set(members.map(m => m.userId))
  const sortedMembers = [...members].sort((a, b) => {
    if (a.userId === currentUser?.id) return -1
    if (b.userId === currentUser?.id) return 1
    return 0
  })
  const unassignedMembers = allMembers.filter(u => !assignedUserIds.has(u.id))

  const loading = loadingMembers || loadingAllMembers

  if (loading) return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-9 w-16 rounded-md" />
        </div>
        <Skeleton className="h-9 w-40 rounded-md" />
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-xl ring-1 ring-foreground/10 bg-card py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-6 rounded-md" />
              </div>
              <Skeleton className="h-9 w-full rounded-md mt-2" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )

  return (
    <div className="space-y-6">
      {project && (
        <MemberList
          projectId={id}
          projectName={project.name}
          members={sortedMembers}
          unassignedUsers={unassignedMembers}
          canManageMembers={isAdmin}
        />
      )}
    </div>
  )
}
