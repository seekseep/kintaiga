import { z } from 'zod/v4'
import { eq, and, inArray } from 'drizzle-orm'
import {
  projects,
  projectActivities,
  projectAssignments,
  deletedProjectActivities,
  deletedProjectAssignments,
} from '@db/schema'
import { ValidationError, ForbiddenError } from '@/lib/api-server/errors'
import { canManageOrganizationMembers } from '@/domain/authorization'
import type { Database, OrganizationExecutor } from '../../../types'

const ArchiveOrganizationMemberParametersSchema = z.object({
  userId: z.uuid(),
})

export type ArchiveOrganizationMemberInput = z.input<typeof ArchiveOrganizationMemberParametersSchema>

export async function archiveOrganizationMember(
  dependencies: { db: Database },
  executor: OrganizationExecutor,
  input: ArchiveOrganizationMemberInput,
) {
  const result = ArchiveOrganizationMemberParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  if (!canManageOrganizationMembers(executor)) throw new ForbiddenError()
  const parameters = result.data

  const { db } = dependencies
  const deletedBy = executor.user.id

  await db.transaction(async (tx) => {
    const orgProjects = await tx.select({ id: projects.id })
      .from(projects)
      .where(eq(projects.organizationId, executor.organization.id))
    const projectIds = orgProjects.map(p => p.id)
    if (projectIds.length === 0) return

    const activities = await tx.select().from(projectActivities)
      .where(and(
        eq(projectActivities.userId, parameters.userId),
        inArray(projectActivities.projectId, projectIds),
      ))

    if (activities.length > 0) {
      await tx.insert(deletedProjectActivities).values(
        activities.map(a => ({
          id: a.id,
          userId: a.userId,
          projectId: a.projectId,
          startedAt: a.startedAt,
          endedAt: a.endedAt,
          note: a.note,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
          deletedBy,
        })),
      )
      await tx.delete(projectActivities)
        .where(inArray(projectActivities.id, activities.map(a => a.id)))
    }

    const assignments = await tx.select().from(projectAssignments)
      .where(and(
        eq(projectAssignments.userId, parameters.userId),
        inArray(projectAssignments.projectId, projectIds),
      ))

    if (assignments.length > 0) {
      await tx.insert(deletedProjectAssignments).values(
        assignments.map(a => ({
          id: a.id,
          projectId: a.projectId,
          userId: a.userId,
          startedAt: a.startedAt,
          endedAt: a.endedAt,
          targetMinutes: a.targetMinutes,
          createdAt: a.createdAt,
          deletedBy,
        })),
      )
      await tx.delete(projectAssignments)
        .where(inArray(projectAssignments.id, assignments.map(a => a.id)))
    }
  })
}
