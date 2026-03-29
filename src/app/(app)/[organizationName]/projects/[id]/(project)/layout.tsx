'use client'

import { useParams, usePathname } from 'next/navigation'
import { useOrganization } from '@/contexts/organization-context'
import { useProject } from '@/hooks/api/projects'
import Link from 'next/link'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'
import { ProjectHeader } from '@/components/features/project-header'

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const { id, organizationName } = useParams<{ id: string; organizationName: string }>()
  const { role: organizationRole } = useOrganization()
  const isAdmin = organizationRole === 'owner' || organizationRole === 'manager'
  const pathname = usePathname()

  const basePath = `/${organizationName}/projects/${id}`
  const settingsPath = `${basePath}/settings`
  const isSettings = pathname.startsWith(settingsPath)
  const settingsSubPage = isSettings ? pathname.slice(settingsPath.length).replace(/^\//, '') : null

  const settingsSubPageLabels: Record<string, string> = {
    name: 'プロジェクト名の変更',
    description: '説明の変更',
    activities: '稼働の設定',
    delete: 'プロジェクトの削除',
  }
  const settingsSubPageLabel = settingsSubPage ? settingsSubPageLabels[settingsSubPage] : null

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

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href={`/${organizationName}/projects`}>プロジェクト</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {isSettings ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link href={basePath}>{project.name}</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {settingsSubPageLabel ? (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild><Link href={settingsPath}>設定</Link></BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{settingsSubPageLabel}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbPage>設定</BreadcrumbPage>
                </BreadcrumbItem>
              )}
            </>
          ) : (
            <BreadcrumbItem>
              <BreadcrumbPage>{project.name}</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {!isSettings && (
        <ProjectHeader project={project} projectId={id} basePath={basePath} editable={isAdmin} />
      )}

      {children}
    </div>
  )
}
