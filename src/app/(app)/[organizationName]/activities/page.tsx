'use client'

import { endOfDay } from 'date-fns'
import { useActivities } from '@/hooks/api/activities'
import { useUserProjectStatements } from '@/hooks/api/projects'
import { useMembers } from '@/hooks/api/members'
import { useAuth } from '@/hooks/use-auth'
import { useOrganization } from '@/contexts/organization-context'
import { useActivityFiltersSearchParameters } from '@/hooks/use-activity-filters-search-parameters'
import { RefreshCw } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { ActivityFilters } from '@/components/features/activity-filters'
import { ActivityTable } from '@/components/features/activity-table'

export default function ActivitiesPage() {
  const { user } = useAuth()
  const { role: organizationRole } = useOrganization()
  const isAdmin = organizationRole === 'owner' || organizationRole === 'manager'
  const {
    userFilter, setUserFilter,
    projectFilter, setProjectFilter,
    startDate, setStartDate,
    endDate, setEndDate,
  } = useActivityFiltersSearchParameters()

  const { data: projectsData } = useUserProjectStatements({ limit: 100 })

  const { data: membersData } = useMembers({ limit: 100 }, { enabled: isAdmin })

  const { data: activitiesData, isLoading, isFetching, refetch } = useActivities({
    userId: userFilter === 'all' ? undefined : userFilter,
    projectId: projectFilter === 'all' ? undefined : projectFilter,
    startDate: startDate?.toISOString(),
    endDate: endDate ? endOfDay(endDate).toISOString() : undefined,
  })

  const myProjects = projectsData?.items ?? []
  const users = membersData?.items ?? []
  const activities = activitiesData?.items ?? []

  const userOptions = [
    { value: 'all', label: 'すべて' },
    ...users.map(u => ({ value: u.id, label: u.name })),
  ]
  const projectOptions = [
    { value: 'all', label: 'すべて' },
    ...myProjects.map(p => ({ value: p.id, label: p.name })),
  ]

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>稼働</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-lg">稼働</h1>
        <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <ActivityFilters
        projectOptions={projectOptions}
        projectFilter={projectFilter}
        onProjectFilterChange={setProjectFilter}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        showUserFilter={isAdmin}
        userOptions={userOptions}
        userFilter={userFilter}
        onUserFilterChange={setUserFilter}
      />

      {isLoading ? (
        <div className="space-y-2">
          <div className="rounded-xl ring-1 ring-foreground/10 overflow-hidden">
            <div className="flex border-b">
              {[16, 20, 20, 24, 24, 16, 32, 8].map((w, i) => (
                <div key={i} className="h-10 px-2 flex items-center">
                  <Skeleton className="h-4" style={{ width: `${w * 4}px` }} />
                </div>
              ))}
            </div>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex border-b last:border-0">
                {[16, 20, 20, 24, 24, 16, 32, 8].map((w, j) => (
                  <div key={j} className="h-10 px-2 flex items-center">
                    <Skeleton className="h-4" style={{ width: `${w * 4}px` }} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <ActivityTable
          activities={activities}
          showUserColumn={isAdmin}
        />
      )}
    </div>
  )
}
