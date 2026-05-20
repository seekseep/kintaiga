import { createServerFn } from '@tanstack/react-start'
import { db } from '@/lib/db'
import { getOrganizationExecutor } from '@/lib/server-action/auth'
import { NotFoundError } from '@/lib/errors'
import {
  createOrganizationProject as createOrganizationProjectService,
  deleteOrganizationProject as deleteOrganizationProjectService,
  getOrganizationProject as getOrganizationProjectService,
  getOrganizationProjectConfiguration as getOrganizationProjectConfigService,
  listOrganizationProjectMembers as listOrganizationProjectMembersService,
  updateOrganizationProject as updateOrganizationProjectService,
  updateOrganizationProjectConfiguration as updateOrganizationProjectConfigService,
} from '@/services/organization/project'
import { listOrganizationProjectStatements } from '@/services/organization/project/statement/listOrganizationProjectStatements'
import type {
  PaginatedResponse,
  Project,
  ProjectConfig,
  ProjectMember,
  UserProjectStatement,
} from '@/schemas'
import type { ListOrganizationProjectStatementsInput as ListUserProjectStatementsInput } from '@/services/organization/project/statement/listOrganizationProjectStatements'
import type { CreateOrganizationProjectInput as CreateProjectInput } from '@/services/organization/project/createOrganizationProject'
import type { UpdateOrganizationProjectInput as UpdateProjectInput } from '@/services/organization/project/updateOrganizationProject'
import type { DeleteOrganizationProjectInput as DeleteProjectInput } from '@/services/organization/project/deleteOrganizationProject'
import type { UpdateOrganizationProjectConfigurationInput as UpdateProjectConfigInput } from '@/services/organization/project/configuration/updateOrganizationProjectConfiguration'

export type { Project, ProjectConfig, ProjectMember, UserProjectStatement } from '@/schemas'
export type { CreateOrganizationProjectInput as CreateProjectInput } from '@/services/organization/project/createOrganizationProject'

export type GetOrganizationUserProjectStatementsParameters = ListUserProjectStatementsInput

type ProjectRow = {
  id: string
  name: string
  description: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value
}

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  }
}

export const listOrganizationUserProjectStatements = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      organizationName: string
      parameters?: GetOrganizationUserProjectStatementsParameters
    }) => data,
  )
  .handler(async ({ data }): Promise<PaginatedResponse<UserProjectStatement>> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    const result = await listOrganizationProjectStatements({ db }, executor, data.parameters ?? {})
    return {
      items: result.items.map((item) => ({
        ...toProject(item),
        membershipStatus: item.membershipStatus,
      })),
      count: result.count,
      limit: result.limit,
      offset: result.offset,
    }
  })

export const getOrganizationProject = createServerFn({ method: 'GET' })
  .inputValidator((data: { organizationName: string; projectId: string }) => data)
  .handler(async ({ data }): Promise<Project> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    const project = await getOrganizationProjectService({ db }, executor, { id: data.projectId })
    return toProject(project)
  })

export const createOrganizationProject = createServerFn({ method: 'POST' })
  .inputValidator((data: { organizationName: string; body: CreateProjectInput }) => data)
  .handler(async ({ data }): Promise<Project> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    const created = await createOrganizationProjectService({ db }, executor, data.body)
    return toProject(created)
  })

export const updateOrganizationProject = createServerFn({ method: 'POST' })
  .inputValidator((data: { organizationName: string; input: UpdateProjectInput }) => data)
  .handler(async ({ data }): Promise<Project> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    const updated = await updateOrganizationProjectService({ db }, executor, data.input)
    return toProject(updated)
  })

export const deleteOrganizationProject = createServerFn({ method: 'POST' })
  .inputValidator((data: { organizationName: string; input: DeleteProjectInput }) => data)
  .handler(async ({ data }): Promise<void> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    await deleteOrganizationProjectService({ db }, executor, data.input)
  })

export const getOrganizationProjectConfig = createServerFn({ method: 'GET' })
  .inputValidator((data: { organizationName: string; projectId: string }) => data)
  .handler(async ({ data }): Promise<ProjectConfig | null> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    try {
      return await getOrganizationProjectConfigService({ db }, executor, { id: data.projectId })
    } catch (err) {
      if (err instanceof NotFoundError) return null
      throw err
    }
  })

export type UpdateProjectConfigResult = {
  roundingInterval: number | null
  roundingDirection: ProjectConfig['roundingDirection'] | null
  aggregationUnit: ProjectConfig['aggregationUnit'] | null
  aggregationPeriod: number | null
}

export const updateOrganizationProjectConfig = createServerFn({ method: 'POST' })
  .inputValidator((data: { organizationName: string; input: UpdateProjectConfigInput }) => data)
  .handler(async ({ data }): Promise<UpdateProjectConfigResult> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    return updateOrganizationProjectConfigService({ db }, executor, data.input)
  })

export const listOrganizationProjectMembers = createServerFn({ method: 'GET' })
  .inputValidator((data: { organizationName: string; projectId: string }) => data)
  .handler(async ({ data }): Promise<{ items: ProjectMember[] }> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    const result = await listOrganizationProjectMembersService(
      { db },
      executor,
      { projectId: data.projectId },
    )
    return { items: result.items }
  })
