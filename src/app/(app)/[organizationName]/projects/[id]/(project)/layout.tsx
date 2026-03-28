'use client'

import { useParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useOrganization } from '@/contexts/organization-context'
import { useProject } from '@/hooks/api/projects'
import Link from 'next/link'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'
import { ProjectHeader } from '@/components/features/project-header'

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const { id, organizationName } = useParams<{ id: string; organizationName: string }>()
  const { user: currentUser } = useAuth()
  const { role: organizationRole } = useOrganization()
  const isAdmin = organizationRole === 'owner' || organizationRole === 'manager'

  const { data: project, isLoading } = useProject(id)

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-48" />
      <div className="space-y-1">
        <Skeleton className="h-7 w-40" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-5 w-5 rounded" />
        </div>
      </div>
      <Skeleton className="h-64" />
    </div>
  )
  if (!project) return <p className="text-center text-muted-foreground">プロジェクトが見つかりません</p>

  const basePath = `/${organizationName}/projects/${id}`

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href={`/${organizationName}/projects`}>プロジェクト</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ProjectHeader project={project} projectId={id} basePath={basePath} editable={isAdmin} />

      {children}
    </div>
  )
}
