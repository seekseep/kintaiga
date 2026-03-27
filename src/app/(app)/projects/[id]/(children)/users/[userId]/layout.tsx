'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import { useProject } from '@/hooks/api/projects'
import { useUser } from '@/hooks/api/users'
import Link from 'next/link'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { id: projectId, userId } = useParams<{ id: string; userId: string }>()
  const pathname = usePathname()
  const router = useRouter()

  const { data: project } = useProject(projectId)
  const { data: user } = useUser(userId)

  const basePath = `/projects/${projectId}/users/${userId}`
  const activeTab = pathname.includes('/assignments') ? 'assignments' : 'activities'

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/">プロジェクト</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href={`/projects/${projectId}`}>{project?.name}</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{user?.name ?? '...'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Tabs value={activeTab} onValueChange={(v) => router.push(`${basePath}/${v}`)}>
        <TabsList variant="line">
          <TabsTrigger value="activities">稼働</TabsTrigger>
          <TabsTrigger value="assignments">配属</TabsTrigger>
        </TabsList>
      </Tabs>

      {children}
    </div>
  )
}
