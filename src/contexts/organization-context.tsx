'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { OrganizationRole } from '@/schemas/organization-role'

export interface OrganizationValue {
  id: string
  name: string
  displayName: string
  role: OrganizationRole
}

const OrganizationContext = createContext<OrganizationValue | null>(null)

export function OrganizationProvider({
  value,
  children,
}: {
  value: OrganizationValue
  children: ReactNode
}) {
  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
}

export function useOrganization(): OrganizationValue {
  const ctx = useContext(OrganizationContext)
  if (!ctx) throw new Error('useOrganization must be used within OrganizationProvider')
  return ctx
}
