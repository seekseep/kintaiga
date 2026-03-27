'use client'

import { useParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useProject } from '@/hooks/api/projects'
import Link from 'next/link'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'
import { ProjectHeader } from '@/components/features/project-header'

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>()
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'admin'

  const { data: project, isLoading } = useProject(id)

  if (isLoading) return <Skeleton className="h-64" />
  if (!project) return <p className="text-center text-muted-foreground">プロジェクトが見つかりません</p>

  const basePath = `/projects/${id}`

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/">プロジェクト</Link></BreadcrumbLink>
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
