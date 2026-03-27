'use client'

import { useParams, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useProject } from '@/hooks/api/projects'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'
import { ProjectHeader } from '@/components/features/project-header'
import { ProjectTabs } from '@/components/features/project-tabs'

export default function ProjectDetailLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>()
  const pathname = usePathname()
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'admin'

  const { data: project, isLoading } = useProject(id)

  if (isLoading) return <Skeleton className="h-64" />
  if (!project) return <p className="text-center text-muted-foreground">プロジェクトが見つかりません</p>

  const basePath = `/projects/${id}`
  const tabs = [
    { label: 'メンバー', href: basePath },
    ...(isAdmin ? [{ label: '設定', href: `${basePath}/settings` }] : []),
  ]

  function isActive(href: string) {
    if (href === basePath) {
      return pathname === basePath || pathname.startsWith(`${basePath}/users`)
    }
    return pathname.startsWith(href)
  }

  // サブページ（name, description 編集など）はタブを表示しない
  const isSubPage = ['/name', '/description'].some(p => pathname.endsWith(p))
  if (isSubPage) return <>{children}</>

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">プロジェクト</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ProjectHeader project={project} basePath={basePath} editable={isAdmin} />
      <ProjectTabs tabs={tabs} isActive={isActive} />

      {children}
    </div>
  )
}
