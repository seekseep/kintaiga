'use client'

import { useOrganization } from '@/contexts/organization-context'
import { NotFound } from '@/components/not-found'
import type { OrganizationRole } from '@/schemas/_helpers'

interface OrganizationRoleGuardProps {
  allowedRoles: OrganizationRole[]
  children: React.ReactNode
}

export function OrganizationRoleGuard({ allowedRoles, children }: OrganizationRoleGuardProps) {
  const { role } = useOrganization()

  if (!allowedRoles.includes(role)) {
    return <NotFound />
  }

  return <>{children}</>
}
