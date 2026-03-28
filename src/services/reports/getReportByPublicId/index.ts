import { eq, and, gte, lte } from 'drizzle-orm'
import { reports, activities, projects, users, organizations } from '@db/schema'
import { NotFoundError } from '@/lib/api-server/errors'
import type { DbOrTx } from '../../types'

export async function getReportByPublicId(
  dependencies: { db: DbOrTx },
  publicId: string,
) {
  const { db } = dependencies

  const [report] = await db.select().from(reports)
    .where(eq(reports.publicId, publicId))
    .limit(1)

  if (!report) throw new NotFoundError('レポートが見つかりません')

  const [org] = await db.select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, report.organizationId))
    .limit(1)

  const [user] = await db.select({ name: users.name })
    .from(users)
    .where(eq(users.id, report.userId))
    .limit(1)

  const reportActivities = await db.select({
    id: activities.id,
    projectId: activities.projectId,
    projectName: projects.name,
    startedAt: activities.startedAt,
    endedAt: activities.endedAt,
    note: activities.note,
  })
    .from(activities)
    .innerJoin(projects, eq(activities.projectId, projects.id))
    .where(and(
      eq(activities.userId, report.userId),
      gte(activities.startedAt, report.startDate),
      lte(activities.startedAt, report.endDate),
    ))

  return {
    report: {
      name: report.name,
      startDate: report.startDate,
      endDate: report.endDate,
    },
    organizationName: org?.name ?? '',
    userName: user?.name ?? '',
    activities: reportActivities,
  }
}
