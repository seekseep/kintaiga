'use client'

import { useState } from 'react'
import { useUserProjectStatements } from '@/hooks/api/projects'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { ProjectListWithActivity } from '@/components/features/project-list-with-activity'
import { ProjectFilterTabs, type ProjectFilter } from '@/components/features/project-filter-tabs'
import { CreateProjectButton } from '@/components/features/create-project-button'

export default function ProjectsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [filter, setFilter] = useState<ProjectFilter>('joined')

  const listFilter = isAdmin && filter === 'all' ? undefined : 'joined' as const
  const { data: projectsData, isLoading } = useUserProjectStatements({ filter: listFilter })

  const statements = projectsData?.items ?? []

  const emptyMessage = filter === 'all'
    ? 'プロジェクトはありません'
    : '参加中のプロジェクトはありません'

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>プロジェクト</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-lg">プロジェクト</h1>
        {isAdmin && <CreateProjectButton />}
      </div>

      {isAdmin && (
        <ProjectFilterTabs filter={filter} onFilterChange={setFilter} />
      )}

      {isLoading ? (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl ring-1 ring-foreground/10 bg-card pt-4 pb-3 px-4 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-6 rounded-md" />
              </div>
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      ) : user ? (
        <ProjectListWithActivity
          statements={statements}
          currentUserId={user.id}
          emptyMessage={emptyMessage}
        />
      ) : null}
    </div>
  )
}
