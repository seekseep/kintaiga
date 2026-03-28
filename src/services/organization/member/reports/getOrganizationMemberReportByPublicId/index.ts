import { eq, and, gte, lte } from 'drizzle-orm'
import { projectActivityReports, projectActivities, projects, users, organizations } from '@db/schema'
import { NotFoundError } from '@/lib/api-server/errors'
import type { DbOrTx } from '../../../../types'

export async function getOrganizationMemberReportByPublicId(
  dependencies: { db: DbOrTx },
  publicId: string,
) {
  const { db } = dependencies

  const [report] = await db.select().from(projectActivityReports)
    .where(eq(projectActivityReports.publicId, publicId))
    .limit(1)

  if (!report) throw new NotFoundError('レポートが見つかりません')

  const [organization] = await db.select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, report.organizationId))
    .limit(1)

  const [user] = await db.select({ name: users.name })
    .from(users)
    .where(eq(users.id, report.userId))
    .limit(1)

  const reportActivities = await db.select({
    id: projectActivities.id,
    projectId: projectActivities.projectId,
    projectName: projects.name,
    startedAt: projectActivities.startedAt,
    endedAt: projectActivities.endedAt,
    note: projectActivities.note,
  })
    .from(projectActivities)
    .innerJoin(projects, eq(projectActivities.projectId, projects.id))
    .where(and(
      eq(projectActivities.userId, report.userId),
      gte(projectActivities.startedAt, report.startDate),
      lte(projectActivities.startedAt, report.endDate),
    ))

  return {
    report: {
      name: report.name,
      startDate: report.startDate,
      endDate: report.endDate,
    },
    organizationName: organization?.name ?? '',
    userName: user?.name ?? '',
    activities: reportActivities,
  }
}
