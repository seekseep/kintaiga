import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { users, projectActivities, projectAssignments, deletedUsers, deletedProjectActivities, deletedProjectAssignments } from '@db/schema'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { canModifyUser } from '@/domain/authorization'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, OrganizationExecutor } from '../../types'

const ArchiveAndDeleteUserParametersSchema = z.object({
  targetId: z.string(),
  anonymizeName: z.string().optional(),
})

export type ArchiveAndDeleteUserInput = z.input<typeof ArchiveAndDeleteUserParametersSchema>
export type ArchiveAndDeleteUserParameters = z.output<typeof ArchiveAndDeleteUserParametersSchema>

export async function archiveAndDeleteUser(
  dependencies: { db: Database; supabase: SupabaseClient },
  executor: OrganizationExecutor,
  input: ArchiveAndDeleteUserInput,
) {
  const result = ArchiveAndDeleteUserParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  if (!canModifyUser(executor, parameters.targetId)) throw new ForbiddenError()

  const { db, supabase } = dependencies
  const deletedBy = executor.user.id

  await db.transaction(async (tx) => {
    const targetRows = await tx.select().from(users).where(eq(users.id, parameters.targetId))
    const target = targetRows[0]
    if (!target) throw new NotFoundError()

    const userActivities = await tx.select().from(projectActivities).where(eq(projectActivities.userId, parameters.targetId))
    const userAssignments = await tx.select().from(projectAssignments).where(eq(projectAssignments.userId, parameters.targetId))

    await tx.insert(deletedUsers).values({
      id: target.id,
      name: parameters.anonymizeName ?? target.name,
      role: target.role,
      iconUrl: parameters.anonymizeName ? null : target.iconUrl,
      createdAt: target.createdAt,
      updatedAt: target.updatedAt,
      deletedBy,
    })

    if (userActivities.length > 0) {
      await tx.insert(deletedProjectActivities).values(
        userActivities.map(a => ({
          id: a.id,
          userId: a.userId,
          projectId: a.projectId,
          startedAt: a.startedAt,
          endedAt: a.endedAt,
          note: a.note,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
          deletedBy,
        }))
      )
    }

    if (userAssignments.length > 0) {
      await tx.insert(deletedProjectAssignments).values(
        userAssignments.map(a => ({
          id: a.id,
          projectId: a.projectId,
          userId: a.userId,
          startedAt: a.startedAt,
          endedAt: a.endedAt,
          createdAt: a.createdAt,
          deletedBy,
        }))
      )
    }

    await tx.delete(users).where(eq(users.id, parameters.targetId))
  })

  const { error } = await supabase.auth.admin.deleteUser(parameters.targetId)
  if (error) {
    console.error(`Failed to delete Supabase auth user ${parameters.targetId}:`, error.message)
  }
}
