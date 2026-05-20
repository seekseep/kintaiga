import { createServerFn } from '@tanstack/react-start'
import { db } from '@/lib/db'
import { getOrganizationExecutor } from '@/lib/server-action/auth'
import {
  createOrganizationProjectMemberActivity,
  deleteOrganizationProjectMemberActivity,
  getOrganizationProjectMemberActivity,
  listOrganizationProjectMemberActivities,
  updateOrganizationProjectMemberActivity,
} from '@/services/organization/project/member/activity'
import type { PaginatedResponse, ProjectActivity } from '@/schemas'
import type { ListOrganizationProjectMemberActivitiesInput as ListActivitiesInput } from '@/services/organization/project/member/activity/listOrganizationProjectMemberActivities'
import type { CreateOrganizationProjectMemberActivityInput as CreateActivityInput } from '@/services/organization/project/member/activity/createOrganizationProjectMemberActivity'
import type { UpdateOrganizationProjectMemberActivityInput as UpdateActivityInput } from '@/services/organization/project/member/activity/updateOrganizationProjectMemberActivity'
import type { DeleteOrganizationProjectMemberActivityInput as DeleteActivityInput } from '@/services/organization/project/member/activity/deleteOrganizationProjectMemberActivity'

export type { Activity, ProjectActivity } from '@/schemas'
export type { CreateOrganizationProjectMemberActivityInput as CreateActivityInput } from '@/services/organization/project/member/activity/createOrganizationProjectMemberActivity'

type ActivityRow = {
  id: string
  userId: string
  projectId: string
  startedAt: Date | string
  endedAt: Date | string | null
  note: string | null
  createdAt: Date | string
  updatedAt: Date | string
  projectName?: string | null
  userName?: string | null
}

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value
}

function toProjectActivity(row: ActivityRow): ProjectActivity {
  return {
    id: row.id,
    userId: row.userId,
    projectId: row.projectId,
    startedAt: toIso(row.startedAt),
    endedAt: row.endedAt === null ? null : toIso(row.endedAt),
    note: row.note,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    projectName: row.projectName ?? undefined,
    userName: row.userName ?? undefined,
  }
}

export const listOrganizationActivities = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { organizationName: string; parameters?: ListActivitiesInput }) => data,
  )
  .handler(async ({ data }): Promise<PaginatedResponse<ProjectActivity>> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    const result = await listOrganizationProjectMemberActivities(
      { db },
      executor,
      data.parameters ?? {},
    )
    return {
      items: result.items.map(toProjectActivity),
      count: result.count,
      limit: result.limit,
      offset: result.offset,
    }
  })

export const getOrganizationActivity = createServerFn({ method: 'GET' })
  .inputValidator((data: { organizationName: string; activityId: string }) => data)
  .handler(async ({ data }): Promise<ProjectActivity> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    const activity = await getOrganizationProjectMemberActivity(
      { db },
      executor,
      { id: data.activityId },
    )
    return toProjectActivity(activity)
  })

export const createOrganizationActivity = createServerFn({ method: 'POST' })
  .inputValidator((data: { organizationName: string; body: CreateActivityInput }) => data)
  .handler(async ({ data }): Promise<ProjectActivity> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    const created = await createOrganizationProjectMemberActivity({ db }, executor, data.body)
    return toProjectActivity(created)
  })

export const updateOrganizationActivity = createServerFn({ method: 'POST' })
  .inputValidator((data: { organizationName: string; input: UpdateActivityInput }) => data)
  .handler(async ({ data }): Promise<ProjectActivity> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    const updated = await updateOrganizationProjectMemberActivity({ db }, executor, data.input)
    return toProjectActivity(updated)
  })

export const deleteOrganizationActivity = createServerFn({ method: 'POST' })
  .inputValidator((data: { organizationName: string; input: DeleteActivityInput }) => data)
  .handler(async ({ data }): Promise<void> => {
    const executor = await getOrganizationExecutor(data.organizationName)
    await deleteOrganizationProjectMemberActivity({ db }, executor, data.input)
  })
