import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import {
  organizationAssignments,
  organizationConfigurations,
  projects,
  projectAssignments,
  projectActivities,
  users,
} from '@db/schema'
import { ValidationError, ForbiddenError } from '@/lib/api-server/errors'
import { canActAsOrganizationManager } from '@/domain/authorization'
import { OrganizationExportPayloadSchema } from '../exportOrganization/schema'
import type { Database, OrganizationExecutor } from '../../types'

const ImportOrganizationParametersSchema = z.object({
  payload: OrganizationExportPayloadSchema,
  overwriteConfiguration: z.boolean().optional().default(false),
})

export type ImportOrganizationInput = z.input<typeof ImportOrganizationParametersSchema>

export type ImportOrganizationResult = {
  stats: {
    projects: number
    assignments: number
    activities: number
  }
  skipped: {
    missingMembers: string[] // emails referenced in payload but not present in target org
    assignments: number
    activities: number
    projects: { name: string; reason: string }[]
  }
}

export async function importOrganization(
  dependencies: { db: Database },
  executor: OrganizationExecutor,
  input: ImportOrganizationInput,
): Promise<ImportOrganizationResult> {
  if (!canActAsOrganizationManager(executor)) throw new ForbiddenError()

  const result = ImportOrganizationParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const { payload, overwriteConfiguration } = result.data

  const { db } = dependencies
  const organizationId = executor.organization.id

  // 1) Look up users belonging to the target organization, indexed by email
  const memberRows = await db
    .select({
      userId: users.id,
      email: users.email,
    })
    .from(organizationAssignments)
    .innerJoin(users, eq(organizationAssignments.userId, users.id))
    .where(eq(organizationAssignments.organizationId, organizationId))

  const userIdByEmail = new Map<string, string>()
  for (const row of memberRows) {
    if (row.email) userIdByEmail.set(row.email, row.userId)
  }

  // 2) Determine which payload-referenced emails are missing in target org
  const referencedEmails = new Set<string>()
  for (const m of payload.members) referencedEmails.add(m.email)
  for (const p of payload.projects) {
    for (const a of p.assignments) referencedEmails.add(a.memberEmail)
    for (const a of p.activities) referencedEmails.add(a.memberEmail)
  }
  const missingMembers: string[] = []
  for (const email of referencedEmails) {
    if (!userIdByEmail.has(email)) missingMembers.push(email)
  }

  // 3) Fetch existing project names in target org to prevent duplicates
  const existingProjects = await db
    .select({ name: projects.name })
    .from(projects)
    .where(eq(projects.organizationId, organizationId))
  const existingProjectNames = new Set(existingProjects.map((p) => p.name))

  const stats: ImportOrganizationResult['stats'] = {
    projects: 0,
    assignments: 0,
    activities: 0,
  }
  const skipped: ImportOrganizationResult['skipped'] = {
    missingMembers,
    assignments: 0,
    activities: 0,
    projects: [],
  }

  await db.transaction(async (tx) => {
    if (overwriteConfiguration) {
      await tx.update(organizationConfigurations).set({
        roundingInterval: payload.configuration.roundingInterval,
        roundingDirection: payload.configuration.roundingDirection,
        aggregationUnit: payload.configuration.aggregationUnit,
        aggregationPeriod: payload.configuration.aggregationPeriod,
        updatedAt: new Date(),
      }).where(eq(organizationConfigurations.organizationId, organizationId))
    }

    for (const project of payload.projects) {
      if (existingProjectNames.has(project.name)) {
        skipped.projects.push({ name: project.name, reason: '同名プロジェクトが既に存在します' })
        continue
      }
      const [insertedProject] = await tx.insert(projects).values({
        organizationId,
        name: project.name,
        description: project.description,
        roundingInterval: project.roundingInterval,
        roundingDirection: project.roundingDirection,
        aggregationUnit: project.aggregationUnit,
        aggregationPeriod: project.aggregationPeriod,
      }).returning()
      stats.projects += 1

      const assignmentValues: typeof projectAssignments.$inferInsert[] = []
      for (const a of project.assignments) {
        const userId = userIdByEmail.get(a.memberEmail)
        if (!userId) {
          skipped.assignments += 1
          continue
        }
        assignmentValues.push({
          projectId: insertedProject.id,
          userId,
          startedAt: new Date(a.startedAt),
          endedAt: a.endedAt ? new Date(a.endedAt) : null,
          targetMinutes: a.targetMinutes,
        })
      }
      if (assignmentValues.length > 0) {
        await tx.insert(projectAssignments).values(assignmentValues)
        stats.assignments += assignmentValues.length
      }

      const activityValues: typeof projectActivities.$inferInsert[] = []
      for (const a of project.activities) {
        const userId = userIdByEmail.get(a.memberEmail)
        if (!userId) {
          skipped.activities += 1
          continue
        }
        activityValues.push({
          projectId: insertedProject.id,
          userId,
          startedAt: new Date(a.startedAt),
          endedAt: a.endedAt ? new Date(a.endedAt) : null,
          note: a.note,
        })
      }
      if (activityValues.length > 0) {
        const CHUNK_SIZE = 500
        for (let i = 0; i < activityValues.length; i += CHUNK_SIZE) {
          await tx.insert(projectActivities).values(activityValues.slice(i, i + CHUNK_SIZE))
        }
        stats.activities += activityValues.length
      }
    }
  })

  return { stats, skipped }
}

