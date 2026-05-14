'use server'

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

export async function listOrganizationActivities(
  organizationName: string,
  parameters?: ListActivitiesInput,
): Promise<PaginatedResponse<ProjectActivity>> {
  const executor = await getOrganizationExecutor(organizationName)
  const result = await listOrganizationProjectMemberActivities({ db }, executor, parameters ?? {})
  return {
    items: result.items.map(toProjectActivity),
    count: result.count,
    limit: result.limit,
    offset: result.offset,
  }
}

export async function getOrganizationActivity(
  organizationName: string,
  activityId: string,
): Promise<ProjectActivity> {
  const executor = await getOrganizationExecutor(organizationName)
  const activity = await getOrganizationProjectMemberActivity({ db }, executor, { id: activityId })
  return toProjectActivity(activity)
}

export async function createOrganizationActivity(
  organizationName: string,
  body: CreateActivityInput,
): Promise<ProjectActivity> {
  const executor = await getOrganizationExecutor(organizationName)
  const created = await createOrganizationProjectMemberActivity({ db }, executor, body)
  return toProjectActivity(created)
}

export async function updateOrganizationActivity(
  organizationName: string,
  input: UpdateActivityInput,
): Promise<ProjectActivity> {
  const executor = await getOrganizationExecutor(organizationName)
  const updated = await updateOrganizationProjectMemberActivity({ db }, executor, input)
  return toProjectActivity(updated)
}

export async function deleteOrganizationActivity(
  organizationName: string,
  input: DeleteActivityInput,
): Promise<void> {
  const executor = await getOrganizationExecutor(organizationName)
  await deleteOrganizationProjectMemberActivity({ db }, executor, input)
}
