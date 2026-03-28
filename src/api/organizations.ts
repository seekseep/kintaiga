import { api } from '@/lib/api'
import type { OrganizationRole, Plan } from '@/schemas/_helpers'
import type { CreateOrganizationInput } from '@/services/organizations/createOrganization'

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

export async function getOrganization(organizationName: string) {
  const r = await api.get<OrganizationDetail>(`/organizations/${organizationName}`)
  return r.data
}

export async function getMyOrganizations() {
  const r = await api.get<{ items: OrganizationMembership[] }>('/me/organizations')
  return r.data
}

export async function createOrganization(body: CreateOrganizationInput) {
  const r = await api.post<Organization>('/organizations', body)
  return r.data
}

export async function updateOrganization(organizationName: string, body: { name?: string; displayName?: string }) {
  const r = await api.patch<Organization>(`/organizations/${organizationName}`, body)
  return r.data
}

export async function deleteOrganization(organizationName: string) {
  const r = await api.delete<Organization>(`/organizations/${organizationName}`)
  return r.data
}

export async function checkOrganizationName(name: string) {
  const r = await api.get<CheckNameResult>(`/organizations/check-name?name=${encodeURIComponent(name)}`)
  return r.data
}

export async function getOrganizationMembers(organizationName: string) {
  const r = await api.get<{ items: OrganizationMember[] }>(`/organizations/${organizationName}/members`)
  return r.data
}
