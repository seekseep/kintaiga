'use client'

import { endOfDay } from 'date-fns'
import { useActivities } from '@/hooks/api/activities'
import { useUserProjectStatements } from '@/hooks/api/projects'
import { useUsers } from '@/hooks/api/users'
import { useAuth } from '@/hooks/use-auth'
import { useActivityFiltersSearchParams } from '@/hooks/use-activity-filters-search-params'
import { RefreshCw } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { ActivityFilters } from '@/components/features/activity-filters'
import { ActivityTable } from '@/components/features/activity-table'

export default function ActivitiesPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const {
    userFilter, setUserFilter,
    projectFilter, setProjectFilter,
    startDate, setStartDate,
    endDate, setEndDate,
  } = useActivityFiltersSearchParams()

  const { data: projectsData } = useUserProjectStatements({ limit: 100 })

  const { data: usersData } = useUsers({ limit: 100 }, { enabled: isAdmin })

  const { data: activitiesData, isLoading, isFetching, refetch } = useActivities({
    userId: userFilter === 'all' ? undefined : userFilter,
    projectId: projectFilter === 'all' ? undefined : projectFilter,
    startDate: startDate?.toISOString(),
    endDate: endDate ? endOfDay(endDate).toISOString() : undefined,
  })

  const myProjects = projectsData?.items ?? []
  const users = usersData?.items ?? []
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
        <Skeleton className="h-64" />
      ) : (
        <ActivityTable
          activities={activities}
          showUserColumn={isAdmin}
        />
      )}
    </div>
  )
}
