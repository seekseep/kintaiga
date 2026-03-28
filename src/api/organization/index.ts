import { api } from '@/lib/api'
import type { OrganizationRole } from '@/schemas/organization-role'
import type { Plan } from '@/schemas/plan'
import type { CreateOrganizationInput } from '@/services/organization/createOrganization'

export interface Organization {
  id: string
  name: string
  displayName: string
  plan: Plan
  createdAt: string
}

export interface OrganizationMembership {
  id: string
  name: string
  displayName: string
  plan: Plan
  organizationRole: OrganizationRole
  createdAt: string
}

export interface OrganizationMember {
  id: string
  userId: string
  organizationRole: OrganizationRole
  createdAt: string
  userName: string
  userIconUrl: string | null
}

export interface OrganizationDetail {
  organizationId: string
  organizationDisplayName: string
  organizationRole: OrganizationRole
  organizationPlan: Plan
}

export interface CheckNameResult {
  available: boolean
  reason: string | null
}

export async function getOrganization(
  organizationName: string
) {
  const { data } = await api.get<OrganizationDetail>(
    `/organizations/${organizationName}`
  )
  return data
}

export async function listMyOrganizations() {
  const { data } = await api.get<{ items: OrganizationMembership[] }>(
    '/me/organizations'
  )
  return data
}

export async function createOrganization(
  body: CreateOrganizationInput
) {
  const { data } = await api.post<Organization>(
    '/organizations',
    body
  )
  return data
}

export async function updateOrganization(
  organizationName: string,
  body: { name?: string; displayName?: string }
) {
  const { data } = await api.patch<Organization>(
    `/organizations/${organizationName}`,
    body
  )
  return data
}

export async function deleteOrganization(
  organizationName: string
) {
  await api.delete(
    `/organizations/${organizationName}`
  )
}

export async function checkOrganizationName(
  name: string
) {
  const { data } = await api.get<CheckNameResult>(
    `/organizations/check-name?name=${encodeURIComponent(name)}`
  )
  return data
}

export async function listOrganizationMembers(
  organizationName: string
) {
  const { data } = await api.get<{ items: OrganizationMember[] }>(
    `/organizations/${organizationName}/members`
  )
  return data
}
