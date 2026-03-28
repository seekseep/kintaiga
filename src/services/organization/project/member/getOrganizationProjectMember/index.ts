import { z } from 'zod/v4'
import { eq } from 'drizzle-orm'
import { projectAssignments } from '@db/schema'
import { ValidationError, NotFoundError } from '@/lib/api-server/errors'
import type { DbOrTx, OrganizationExecutor } from '../../../../types'

const GetOrganizationProjectMemberParametersSchema = z.object({
  id: z.string(),
})

export type GetOrganizationProjectMemberInput = z.input<typeof GetOrganizationProjectMemberParametersSchema>
export type GetOrganizationProjectMemberParameters = z.output<typeof GetOrganizationProjectMemberParametersSchema>

export async function getOrganizationProjectMember(
  dependencies: { db: DbOrTx },
  _executor: OrganizationExecutor,
  input: GetOrganizationProjectMemberInput,
) {
  const result = GetOrganizationProjectMemberParametersSchema.safeParse(input)
  if (!result.success) throw new ValidationError(result.error.issues)
  const parameters = result.data

  const { db } = dependencies
  const assignmentRows = await db.select().from(projectAssignments).where(eq(projectAssignments.id, parameters.id))
  const assignment = assignmentRows[0]
  if (!assignment) throw new NotFoundError()
  return assignment
}
