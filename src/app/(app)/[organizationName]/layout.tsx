'use client'

import { useParams } from 'next/navigation'
import { useOrganizationDetail } from '@/hooks/api/organizations'
import { OrganizationProvider, type OrganizationValue } from '@/contexts/organization-context'

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  const { organizationName } = useParams<{ organizationName: string }>()

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
    plan: organization.organizationPlan,
  }

  return <OrganizationProvider value={value}>{children}</OrganizationProvider>
}
