import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useOrganization } from '@/contexts/organization-context'
import { NotFound } from '@/components/not-found'

export const Route = createFileRoute('/_app/$organizationName/members')({
  component: MembersLayout,
})

function MembersLayout() {
  const { role } = useOrganization()

  if (role !== 'owner' && role !== 'manager') {
    return <NotFound />
  }

  return <Outlet />
}
