import { db } from '@/lib/db'
import { getOrganizationExecutor } from '@/lib/server-action/auth'
import { defineServerFn } from '@/lib/server-fn'
import {
  addOrganizationProjectMember as addOrganizationProjectMemberService,
  getOrganizationProjectMember as getOrganizationProjectMemberService,
  listOrganizationProjectMembers as listOrganizationProjectMembersService,
  removeOrganizationProjectMember as removeOrganizationProjectMemberService,
  updateOrganizationProjectMember as updateOrganizationProjectMemberService,
} from '@/services/organization/project/member'
import type { PaginatedResponse, ProjectAssignment, ProjectMember } from '@/schemas'
import type { ListOrganizationProjectMembersInput as ListProjectMembersInput } from '@/services/organization/project/member/listOrganizationProjectMembers'
import type { AddOrganizationProjectMemberInput as CreateProjectMemberInput } from '@/services/organization/project/member/addOrganizationProjectMember'
import type { UpdateOrganizationProjectMemberInput as UpdateProjectMemberInput } from '@/services/organization/project/member/updateOrganizationProjectMember'
import type { RemoveOrganizationProjectMemberInput as DeleteProjectMemberInput } from '@/services/organization/project/member/removeOrganizationProjectMember'

export type { ProjectAssignment } from '@/schemas'
export type { AddOrganizationProjectMemberInput as CreateProjectMemberInput } from '@/services/organization/project/member/addOrganizationProjectMember'

export type ListOrganizationProjectMembersParameters = Partial<Omit<ListProjectMembersInput, 'active' | 'projectId'>> & {
  projectId: string
  active?: boolean
}

type AssignmentRow = {
  id: string
  projectId: string
  userId: string
  startedAt: Date | string
  endedAt: Date | string | null
  targetMinutes: number | null
  createdAt: Date | string
}

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value
}

function toProjectAssignment(row: AssignmentRow): ProjectAssignment {
  return {
    id: row.id,
    projectId: row.projectId,
    userId: row.userId,
    startedAt: toIso(row.startedAt),
    endedAt: row.endedAt === null ? null : toIso(row.endedAt),
    targetMinutes: row.targetMinutes,
    createdAt: toIso(row.createdAt),
  }
}

export const listOrganizationProjectMembers = defineServerFn(
  async ({
    organizationName,
    parameters,
  }: {
    organizationName: string
    parameters: ListOrganizationProjectMembersParameters
  }): Promise<PaginatedResponse<ProjectMember>> => {
    const executor = await getOrganizationExecutor(organizationName)
    const { active, ...rest } = parameters
    const input = {
      ...rest,
      ...(active != null ? { active: String(active) } : {}),
    }
    const result = await listOrganizationProjectMembersService({ db }, executor, input)
    return {
      items: result.items,
      count: result.count,
      limit: result.limit,
      offset: result.offset,
    }
  },
)

export const getOrganizationProjectMember = defineServerFn(
  async ({
    organizationName,
    projectMemberId,
  }: {
    organizationName: string
    projectMemberId: string
  }): Promise<ProjectAssignment> => {
    const executor = await getOrganizationExecutor(organizationName)
    const assignment = await getOrganizationProjectMemberService({ db }, executor, { id: projectMemberId })
    return toProjectAssignment(assignment)
  },
)

export const createOrganizationProjectMember = defineServerFn(
  async ({
    organizationName,
    body,
  }: {
    organizationName: string
    body: CreateProjectMemberInput
  }): Promise<ProjectAssignment> => {
    const executor = await getOrganizationExecutor(organizationName)
    const created = await addOrganizationProjectMemberService({ db }, executor, body)
    return toProjectAssignment(created)
  },
)

export const updateOrganizationProjectMember = defineServerFn(
  async ({
    organizationName,
    input,
  }: {
    organizationName: string
    input: UpdateProjectMemberInput
  }): Promise<ProjectAssignment> => {
    const executor = await getOrganizationExecutor(organizationName)
    const updated = await updateOrganizationProjectMemberService({ db }, executor, input)
    return toProjectAssignment(updated)
  },
)

export const deleteOrganizationProjectMember = defineServerFn(
  async ({
    organizationName,
    input,
  }: {
    organizationName: string
    input: DeleteProjectMemberInput & { projectId: string }
  }): Promise<void> => {
    const executor = await getOrganizationExecutor(organizationName)
    await removeOrganizationProjectMemberService({ db }, executor, { id: input.id })
  },
)
