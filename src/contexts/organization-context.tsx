'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { OrganizationRole, Plan } from '@/schemas/_helpers'

export interface OrganizationValue {
  id: string
  name: string
  displayName: string
  role: OrganizationRole
  plan: Plan
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
