import { createFileRoute, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { useProject, useProjectMembers } from '@/hooks/api/projects'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const Route = createFileRoute('/_app/$organizationName/projects/$id/members/$memberId')({
  component: MemberLayout,
})

function MemberLayout() {
  const { id: projectId, memberId, organizationName } = Route.useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const { data: project } = useProject(projectId)
  const { data: membersData } = useProjectMembers(projectId)
  const member = membersData?.items?.find((m) => m.userId === memberId)

  const basePath = `/${organizationName}/projects/${projectId}/members/${memberId}`
  const activeTab = pathname.includes('/assignments') ? 'assignments' : 'activities'

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to={`/${organizationName}/projects`}>プロジェクト</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink to={`/${organizationName}/projects/${projectId}`}>{project?.name}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{member?.name ?? '...'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Tabs value={activeTab} onValueChange={(v) => navigate({ to: `${basePath}/${v}` })}>
        <TabsList variant="line">
          <TabsTrigger value="activities">稼働</TabsTrigger>
          <TabsTrigger value="assignments">配属</TabsTrigger>
        </TabsList>
      </Tabs>

      <Outlet />
    </div>
  )
}
