import { createServerFn } from '@tanstack/react-start'
import { db } from '@/lib/db'
import { getOrganizationExecutor } from '@/lib/server-action/auth'
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

export const listOrganizationProjectMembers = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      organizationName: string
      parameters: ListOrganizationProjectMembersParameters
    }) => data,
  )
  .handler(async ({ data }): Promise<PaginatedResponse<ProjectMember>> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    const { active, ...rest } = data.parameters
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
  })

export const getOrganizationProjectMember = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { organizationName: string; projectId: string; projectMemberId: string }) => data,
  )
  .handler(async ({ data }): Promise<ProjectAssignment> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    const assignment = await getOrganizationProjectMemberService(
      { db },
      executor,
      { id: data.projectMemberId },
    )
    return toProjectAssignment(assignment)
  })

export const createOrganizationProjectMember = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { organizationName: string; body: CreateProjectMemberInput }) => data,
  )
  .handler(async ({ data }): Promise<ProjectAssignment> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    const created = await addOrganizationProjectMemberService({ db }, executor, data.body)
    return toProjectAssignment(created)
  })

export const updateOrganizationProjectMember = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { organizationName: string; input: UpdateProjectMemberInput }) => data,
  )
  .handler(async ({ data }): Promise<ProjectAssignment> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    const updated = await updateOrganizationProjectMemberService({ db }, executor, data.input)
    return toProjectAssignment(updated)
  })

export const deleteOrganizationProjectMember = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      organizationName: string
      input: DeleteProjectMemberInput & { projectId: string }
    }) => data,
  )
  .handler(async ({ data }): Promise<void> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    await removeOrganizationProjectMemberService({ db }, executor, { id: data.input.id })
  })
