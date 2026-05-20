import { createServerFn } from '@tanstack/react-start'
import { db } from '@/lib/db'
import { getOrganizationExecutor } from '@/lib/server-action/auth'
import {
  addOrganizationMember as addOrganizationMemberService,
  archiveOrganizationMember,
  getOrganizationMember as getOrganizationMemberService,
  listOrganizationMembers as listOrganizationMembersService,
  removeOrganizationMember,
  updateOrganizationMemberRole as updateOrganizationMemberRoleService,
} from '@/services/organization'
import { resolveUserIdFromMemberId } from '@/domain/member'
import type { ListOrganizationMembersInput } from '@/services/organization/member/listOrganizationMembers'
import type { AddOrganizationMemberInput } from '@/services/organization/member/addOrganizationMember'
import type { Member, PaginatedResponse } from '@/schemas'

export type { Member } from '@/schemas'

type MemberRow = {
  id: string
  userId: string
  email: string | null
  name: string
  role: Member['role']
  organizationRole: Member['organizationRole']
  iconUrl: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

function toMember(row: MemberRow): Member {
  return {
    id: row.id,
    userId: row.userId,
    email: row.email,
    name: row.name,
    role: row.role,
    organizationRole: row.organizationRole,
    iconUrl: row.iconUrl,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
  }
}

export const listOrganizationMembers = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { organizationName: string; parameters?: ListOrganizationMembersInput }) => data,
  )
  .handler(async ({ data }): Promise<PaginatedResponse<Member>> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    const result = await listOrganizationMembersService({ db }, executor, data.parameters)
    return {
      items: result.items.map(toMember),
      count: result.count,
      limit: result.limit,
      offset: result.offset,
    }
  })

export const getOrganizationMember = createServerFn({ method: 'GET' })
  .inputValidator((data: { organizationName: string; memberId: string }) => data)
  .handler(async ({ data }): Promise<Member> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    const member = await getOrganizationMemberService({ db }, executor, { memberId: data.memberId })
    return toMember(member)
  })

export const addOrganizationMember = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { organizationName: string; body: AddOrganizationMemberInput }) => data,
  )
  .handler(async ({ data }): Promise<Member> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    const assignment = await addOrganizationMemberService({ db }, executor, data.body)
    const member = await getOrganizationMemberService({ db }, executor, { memberId: assignment.id })
    return toMember(member)
  })

export const updateOrganizationMemberRole = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      organizationName: string
      memberId: string
      body: { role: 'manager' | 'worker' }
    }) => data,
  )
  .handler(async ({ data }): Promise<Member> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    const { userId } = await resolveUserIdFromMemberId(db, executor.organization.id, data.memberId)
    await updateOrganizationMemberRoleService({ db }, executor, { userId, role: data.body.role })
    const member = await getOrganizationMemberService({ db }, executor, { memberId: data.memberId })
    return toMember(member)
  })

export const deleteOrganizationMember = createServerFn({ method: 'POST' })
  .inputValidator((data: { organizationName: string; memberId: string }) => data)
  .handler(async ({ data }): Promise<void> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    const { userId } = await resolveUserIdFromMemberId(db, executor.organization.id, data.memberId)
    await removeOrganizationMember({ db }, executor, { userId })
    await archiveOrganizationMember({ db }, executor, { userId })
  })
