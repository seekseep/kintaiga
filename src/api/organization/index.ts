'use server'

import { db } from '@/lib/db'
import { getUserExecutor, getOrganizationExecutor } from '@/lib/server-action/auth'
import { listMyOrganizations as listMyOrganizationsService } from '@/services/me'
import {
  checkOrganizationName as checkOrganizationNameService,
  createOrganization as createOrganizationService,
  deleteOrganization as deleteOrganizationService,
  getOrganizationByName,
  listOrganizationMembers as listOrganizationMembersService,
  updateOrganization as updateOrganizationService,
} from '@/services/organization'
import type { CreateOrganizationInput } from '@/services/organization/createOrganization'
import type { OrganizationRole } from '@/schemas/organization-role'

export interface Organization {
  id: string
  name: string
  displayName: string
  createdAt: string
}

export interface OrganizationMembership {
  id: string
  name: string
  displayName: string
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
}

export interface CheckNameResult {
  available: boolean
  reason: string | null
}

function toIsoDate(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value
}

export async function getOrganization(organizationName: string): Promise<OrganizationDetail> {
  const executor = await getOrganizationExecutor(organizationName)
  const organization = await getOrganizationByName({ db }, organizationName)
  return {
    organizationId: executor.organization.id,
    organizationDisplayName: organization.displayName ?? '',
    organizationRole: executor.organization.role,
  }
}

export async function listMyOrganizations(): Promise<{ items: OrganizationMembership[] }> {
  const executor = await getUserExecutor()
  const result = await listMyOrganizationsService({ db }, executor)
  const items: OrganizationMembership[] = result.items.map((item) => ({
    id: item.id,
    name: item.name,
    displayName: item.displayName,
    organizationRole: item.organizationRole,
    createdAt: toIsoDate(item.createdAt),
  }))
  return { items }
}

export async function createOrganization(body: CreateOrganizationInput): Promise<Organization> {
  const executor = await getUserExecutor()
  const created = await createOrganizationService({ db }, executor, body)
  return {
    id: created.id,
    name: created.name,
    displayName: created.displayName ?? '',
    createdAt: toIsoDate(created.createdAt),
  }
}

export async function updateOrganization(
  organizationName: string,
  body: { name?: string; displayName?: string },
): Promise<Organization> {
  const executor = await getOrganizationExecutor(organizationName)
  const updated = await updateOrganizationService({ db }, executor, body)
  return {
    id: updated.id,
    name: updated.name,
    displayName: updated.displayName ?? '',
    createdAt: toIsoDate(updated.createdAt),
  }
}

export async function deleteOrganization(organizationName: string): Promise<void> {
  const executor = await getOrganizationExecutor(organizationName)
  await deleteOrganizationService({ db }, executor)
}

export async function checkOrganizationName(name: string): Promise<CheckNameResult> {
  await getUserExecutor()
  return checkOrganizationNameService({ db }, name)
}

export async function listOrganizationMembers(
  organizationName: string,
): Promise<{ items: OrganizationMember[] }> {
  const executor = await getOrganizationExecutor(organizationName)
  const result = await listOrganizationMembersService({ db }, executor)
  const items: OrganizationMember[] = result.items.map((m) => ({
    id: m.id,
    userId: m.userId,
    organizationRole: m.organizationRole,
    createdAt: toIsoDate(m.createdAt),
    userName: m.name,
    userIconUrl: m.iconUrl,
  }))
  return { items }
}
