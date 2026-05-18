import { db } from '@/lib/db'
import { getOrganizationExecutor } from '@/lib/server-action/auth'
import { defineServerFn } from '@/lib/server-fn'
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

export const listOrganizationMembers = defineServerFn(
  async ({
    organizationName,
    parameters,
  }: {
    organizationName: string
    parameters?: ListOrganizationMembersInput
  }): Promise<PaginatedResponse<Member>> => {
    const executor = await getOrganizationExecutor(organizationName)
    const result = await listOrganizationMembersService({ db }, executor, parameters)
    return {
      items: result.items.map(toMember),
      count: result.count,
      limit: result.limit,
      offset: result.offset,
    }
  },
)

export const getOrganizationMember = defineServerFn(
  async ({
    organizationName,
    memberId,
  }: {
    organizationName: string
    memberId: string
  }): Promise<Member> => {
    const executor = await getOrganizationExecutor(organizationName)
    const member = await getOrganizationMemberService({ db }, executor, { memberId })
    return toMember(member)
  },
)

export const addOrganizationMember = defineServerFn(
  async ({
    organizationName,
    body,
  }: {
    organizationName: string
    body: AddOrganizationMemberInput
  }): Promise<Member> => {
    const executor = await getOrganizationExecutor(organizationName)
    const assignment = await addOrganizationMemberService({ db }, executor, body)
    const member = await getOrganizationMemberService({ db }, executor, { memberId: assignment.id })
    return toMember(member)
  },
)

export const updateOrganizationMemberRole = defineServerFn(
  async ({
    organizationName,
    memberId,
    body,
  }: {
    organizationName: string
    memberId: string
    body: { role: 'manager' | 'worker' }
  }): Promise<Member> => {
    const executor = await getOrganizationExecutor(organizationName)
    const { userId } = await resolveUserIdFromMemberId(db, executor.organization.id, memberId)
    await updateOrganizationMemberRoleService({ db }, executor, { userId, role: body.role })
    const member = await getOrganizationMemberService({ db }, executor, { memberId })
    return toMember(member)
  },
)

export const deleteOrganizationMember = defineServerFn(
  async ({
    organizationName,
    memberId,
  }: {
    organizationName: string
    memberId: string
  }): Promise<void> => {
    const executor = await getOrganizationExecutor(organizationName)
    const { userId } = await resolveUserIdFromMemberId(db, executor.organization.id, memberId)
    await removeOrganizationMember({ db }, executor, { userId })
    await archiveOrganizationMember({ db }, executor, { userId })
  },
)
