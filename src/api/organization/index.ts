import { createServerFn } from '@tanstack/react-start'
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

export const getOrganization = createServerFn({ method: 'GET' })
  .inputValidator((organizationName: string) => organizationName)
  .handler(async ({ data: organizationName }): Promise<OrganizationDetail> => {
    const executor = await getOrganizationExecutor(organizationName)
    const organization = await getOrganizationByName({ db }, organizationName)
    return {
      organizationId: executor.organization.id,
      organizationDisplayName: organization.displayName ?? '',
      organizationRole: executor.organization.role,
    }
  })

export const listMyOrganizations = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ items: OrganizationMembership[] }> => {
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
  },
)

export const createOrganization = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateOrganizationInput) => data)
  .handler(async ({ data }): Promise<Organization> => {
    const executor = await getUserExecutor()
    const created = await createOrganizationService({ db }, executor, data)
    return {
      id: created.id,
      name: created.name,
      displayName: created.displayName ?? '',
      createdAt: toIsoDate(created.createdAt),
    }
  })

export const updateOrganization = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { organizationName: string; body: { name?: string; displayName?: string } }) => data,
  )
  .handler(async ({ data }): Promise<Organization> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    const updated = await updateOrganizationService({ db }, executor, data.body)
    return {
      id: updated.id,
      name: updated.name,
      displayName: updated.displayName ?? '',
      createdAt: toIsoDate(updated.createdAt),
    }
  })

export const deleteOrganization = createServerFn({ method: 'POST' })
  .inputValidator((organizationName: string) => organizationName)
  .handler(async ({ data: organizationName }): Promise<void> => {
    const executor = await getOrganizationExecutor(organizationName)
    await deleteOrganizationService({ db }, executor)
  })

export const checkOrganizationName = createServerFn({ method: 'GET' })
  .inputValidator((name: string) => name)
  .handler(async ({ data: name }): Promise<CheckNameResult> => {
    await getUserExecutor()
    return checkOrganizationNameService({ db }, name)
  })

export const listOrganizationMembers = createServerFn({ method: 'GET' })
  .inputValidator((organizationName: string) => organizationName)
  .handler(async ({ data: organizationName }): Promise<{ items: OrganizationMember[] }> => {
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
  })
