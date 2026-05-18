import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useOrganizationDetail } from '@/hooks/api/organizations'
import { OrganizationProvider, type OrganizationValue } from '@/contexts/organization-context'

export const Route = createFileRoute('/_app/$organizationName')({
  component: OrgLayout,
})

function OrgLayout() {
  const { organizationName } = Route.useParams()

  const { data: organization, isLoading, error } = useOrganizationDetail(organizationName)

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <img src="/favicon.png" alt="キンタイガ" className="animate-pulse h-16 w-16" />
      </div>
    )
  }

  if (error || !organization) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">組織が見つかりません</p>
      </div>
    )
  }

  const value: OrganizationValue = {
    id: organization.organizationId,
    name: organizationName,
    displayName: organization.organizationDisplayName,
    role: organization.organizationRole,
  }

  return (
    <OrganizationProvider value={value}>
      <Outlet />
    </OrganizationProvider>
  )
}
