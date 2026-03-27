import type { GetUserProjectStatementsParams } from '@/api/projects'
import type { PaginationParams } from '@/api/types'
import type { GetAssignmentsParams } from '@/api/assignments'

export type ActivityFilters = {
  userId?: string
  ongoing?: boolean
  projectId?: string
  startDate?: string
  endDate?: string
}

export const meKeys = {
  all: ['me'] as const,
  profile: () => [...meKeys.all, 'profile'] as const,
}

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  statements: () => [...projectKeys.all, 'statement'] as const,
  statement: (params?: GetUserProjectStatementsParams) => [...projectKeys.statements(), params] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  config: (id: string) => [...projectKeys.detail(id), 'config'] as const,
  assignments: (id: string) => [...projectKeys.detail(id), 'assignments'] as const,
  members: (id: string) => [...projectKeys.detail(id), 'members'] as const,
}

export const activityKeys = {
  all: ['activities'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (filters?: ActivityFilters) => [...activityKeys.lists(), filters] as const,
  details: () => [...activityKeys.all, 'detail'] as const,
  detail: (id: string) => [...activityKeys.details(), id] as const,
}

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

export const assignmentKeys = {
  all: ['assignments'] as const,
  lists: () => [...assignmentKeys.all, 'list'] as const,
  list: (params?: GetAssignmentsParams) => [...assignmentKeys.lists(), params] as const,
  details: () => [...assignmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...assignmentKeys.details(), id] as const,
}

export const configurationKeys = {
  all: ['configuration'] as const,
  detail: () => [...configurationKeys.all, 'detail'] as const,
}
