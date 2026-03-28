'use client'

import { useOrganization } from '@/contexts/organization-context'

export function useOrganizationPath() {
  const organization = useOrganization()
  return `/${organization.name}`
}
