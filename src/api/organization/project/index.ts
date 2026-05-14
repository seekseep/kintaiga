'use server'

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

export async function listOrganizationUserProjectStatements(
  organizationName: string,
  parameters?: GetOrganizationUserProjectStatementsParameters,
): Promise<PaginatedResponse<UserProjectStatement>> {
  const executor = await getOrganizationExecutor(organizationName)
  const result = await listOrganizationProjectStatements({ db }, executor, parameters ?? {})
  return {
    items: result.items.map((item) => ({
      ...toProject(item),
      membershipStatus: item.membershipStatus,
    })),
    count: result.count,
    limit: result.limit,
    offset: result.offset,
  }
}

export async function getOrganizationProject(
  organizationName: string,
  projectId: string,
): Promise<Project> {
  const executor = await getOrganizationExecutor(organizationName)
  const project = await getOrganizationProjectService({ db }, executor, { id: projectId })
  return toProject(project)
}

export async function createOrganizationProject(
  organizationName: string,
  body: CreateProjectInput,
): Promise<Project> {
  const executor = await getOrganizationExecutor(organizationName)
  const created = await createOrganizationProjectService({ db }, executor, body)
  return toProject(created)
}

export async function updateOrganizationProject(
  organizationName: string,
  input: UpdateProjectInput,
): Promise<Project> {
  const executor = await getOrganizationExecutor(organizationName)
  const updated = await updateOrganizationProjectService({ db }, executor, input)
  return toProject(updated)
}

export async function deleteOrganizationProject(
  organizationName: string,
  input: DeleteProjectInput,
): Promise<void> {
  const executor = await getOrganizationExecutor(organizationName)
  await deleteOrganizationProjectService({ db }, executor, input)
}

export async function getOrganizationProjectConfig(
  organizationName: string,
  projectId: string,
): Promise<ProjectConfig | null> {
  const executor = await getOrganizationExecutor(organizationName)
  try {
    return await getOrganizationProjectConfigService({ db }, executor, { id: projectId })
  } catch (err) {
    if (err instanceof NotFoundError) return null
    throw err
  }
}

export type UpdateProjectConfigResult = {
  roundingInterval: number | null
  roundingDirection: ProjectConfig['roundingDirection'] | null
  aggregationUnit: ProjectConfig['aggregationUnit'] | null
  aggregationPeriod: number | null
}

export async function updateOrganizationProjectConfig(
  organizationName: string,
  input: UpdateProjectConfigInput,
): Promise<UpdateProjectConfigResult> {
  const executor = await getOrganizationExecutor(organizationName)
  return updateOrganizationProjectConfigService({ db }, executor, input)
}

export async function listOrganizationProjectMembers(
  organizationName: string,
  projectId: string,
): Promise<{ items: ProjectMember[] }> {
  const executor = await getOrganizationExecutor(organizationName)
  const result = await listOrganizationProjectMembersService({ db }, executor, { projectId })
  return { items: result.items }
}
