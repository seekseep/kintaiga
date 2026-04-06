'use client'

import { useOrganization } from '@/contexts/organization-context'
import { NotFound } from '@/components/not-found'

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  const { role } = useOrganization()

  if (role !== 'owner' && role !== 'manager') {
    return <NotFound />
  }

  return <>{children}</>
}
