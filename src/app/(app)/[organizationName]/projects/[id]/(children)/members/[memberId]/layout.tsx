'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import { useProject } from '@/hooks/api/projects'
import { useMember } from '@/hooks/api/members'
import Link from 'next/link'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const { id: projectId, memberId, organizationName } = useParams<{ id: string; memberId: string; organizationName: string }>()
  const pathname = usePathname()
  const router = useRouter()

  const { data: project } = useProject(projectId)
  const { data: member } = useMember(memberId)

  const basePath = `/${organizationName}/projects/${projectId}/members/${memberId}`
  const activeTab = pathname.includes('/assignments') ? 'assignments' : 'activities'

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href={`/${organizationName}/projects`}>プロジェクト</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href={`/${organizationName}/projects/${projectId}`}>{project?.name}</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{member?.name ?? '...'}</BreadcrumbPage>
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
