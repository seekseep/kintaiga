import { eq } from 'drizzle-orm'
import {
  organizations,
  organizationAssignments,
  organizationConfigurations,
  projects,
  projectAssignments,
  projectActivities,
  users,
} from '@db/schema'
import { ForbiddenError, NotFoundError } from '@/lib/api-server/errors'
import { canActAsOrganizationManager } from '@/domain/authorization'
import type { DbOrTx, OrganizationExecutor } from '../../types'
import {
  EXPORT_SCHEMA_VERSION,
  type OrganizationExportPayload,
  type ExportProject,
} from './schema'

export async function exportOrganization(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
): Promise<OrganizationExportPayload> {
  if (!canActAsOrganizationManager(executor)) throw new ForbiddenError()

  const { db } = dependencies
  const organizationId = executor.organization.id

  const [organization] = await db.select().from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1)
  if (!organization) throw new NotFoundError('組織が見つかりません')

  const [configurationRow] = await db.select().from(organizationConfigurations)
    .where(eq(organizationConfigurations.organizationId, organizationId))
    .limit(1)
  const configuration = configurationRow ?? {
    roundingInterval: 15,
    roundingDirection: 'ceil' as const,
    aggregationUnit: 'monthly' as const,
    aggregationPeriod: 1,
  }

  const memberRows = await db
    .select({
      email: users.email,
      role: organizationAssignments.role,
    })
    .from(organizationAssignments)
    .leftJoin(users, eq(organizationAssignments.userId, users.id))
    .where(eq(organizationAssignments.organizationId, organizationId))

  const members = memberRows
    .filter((row): row is { email: string; role: typeof row.role } => row.email !== null)
    .map((row) => ({ email: row.email, role: row.role }))

  const projectRows = await db.select().from(projects)
    .where(eq(projects.organizationId, organizationId))

  const projectIds = projectRows.map((p) => p.id)

  const assignmentRows = projectIds.length === 0 ? [] : await db
    .select({
      projectId: projectAssignments.projectId,
      email: users.email,
      startedAt: projectAssignments.startedAt,
      endedAt: projectAssignments.endedAt,
      targetMinutes: projectAssignments.targetMinutes,
    })
    .from(projectAssignments)
    .leftJoin(users, eq(projectAssignments.userId, users.id))
    .innerJoin(projects, eq(projectAssignments.projectId, projects.id))
    .where(eq(projects.organizationId, organizationId))

  const activityRows = projectIds.length === 0 ? [] : await db
    .select({
      projectId: projectActivities.projectId,
      email: users.email,
      startedAt: projectActivities.startedAt,
      endedAt: projectActivities.endedAt,
      note: projectActivities.note,
    })
    .from(projectActivities)
    .leftJoin(users, eq(projectActivities.userId, users.id))
    .innerJoin(projects, eq(projectActivities.projectId, projects.id))
    .where(eq(projects.organizationId, organizationId))

  const assignmentsByProject = new Map<string, ExportProject['assignments']>()
  for (const row of assignmentRows) {
    if (row.email === null) continue
    const list = assignmentsByProject.get(row.projectId) ?? []
    list.push({
      memberEmail: row.email,
      startedAt: row.startedAt.toISOString(),
      endedAt: row.endedAt ? row.endedAt.toISOString() : null,
      targetMinutes: row.targetMinutes,
    })
    assignmentsByProject.set(row.projectId, list)
  }

  const activitiesByProject = new Map<string, ExportProject['activities']>()
  for (const row of activityRows) {
    if (row.email === null) continue
    const list = activitiesByProject.get(row.projectId) ?? []
    list.push({
      memberEmail: row.email,
      startedAt: row.startedAt.toISOString(),
      endedAt: row.endedAt ? row.endedAt.toISOString() : null,
      note: row.note,
    })
    activitiesByProject.set(row.projectId, list)
  }

  const exportProjects: ExportProject[] = projectRows.map((project) => ({
    name: project.name,
    description: project.description,
    roundingInterval: project.roundingInterval,
    roundingDirection: project.roundingDirection,
    aggregationUnit: project.aggregationUnit,
    aggregationPeriod: project.aggregationPeriod,
    assignments: assignmentsByProject.get(project.id) ?? [],
    activities: activitiesByProject.get(project.id) ?? [],
  }))

  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    source: {
      organizationId: organization.id,
      organizationName: organization.name,
    },
    organization: {
      displayName: organization.displayName,
      plan: organization.plan,
    },
    configuration: {
      roundingInterval: configuration.roundingInterval,
      roundingDirection: configuration.roundingDirection,
      aggregationUnit: configuration.aggregationUnit,
      aggregationPeriod: configuration.aggregationPeriod,
    },
    members,
    projects: exportProjects,
  }
}

export { OrganizationExportPayloadSchema, type OrganizationExportPayload } from './schema'
