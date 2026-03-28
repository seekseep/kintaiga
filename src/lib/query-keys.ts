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
  organizations: () => [...meKeys.all, 'organizations'] as const,
}

export const organizationKeys = {
  all: ['organizations'] as const,
  detail: (organizationName: string) => [...organizationKeys.all, organizationName] as const,
  members: (organizationName: string) => [...organizationKeys.detail(organizationName), 'members'] as const,
}

export const projectKeys = {
  all: (organizationName: string) => ['projects', organizationName] as const,
  lists: (organizationName: string) => [...projectKeys.all(organizationName), 'list'] as const,
  statements: (organizationName: string) => [...projectKeys.all(organizationName), 'statement'] as const,
  statement: (organizationName: string, params?: GetUserProjectStatementsParams) => [...projectKeys.statements(organizationName), params] as const,
  details: (organizationName: string) => [...projectKeys.all(organizationName), 'detail'] as const,
  detail: (organizationName: string, id: string) => [...projectKeys.details(organizationName), id] as const,
  config: (organizationName: string, id: string) => [...projectKeys.detail(organizationName, id), 'config'] as const,
  assignments: (organizationName: string, id: string) => [...projectKeys.detail(organizationName, id), 'assignments'] as const,
  members: (organizationName: string, id: string) => [...projectKeys.detail(organizationName, id), 'members'] as const,
}

export const activityKeys = {
  all: (organizationName: string) => ['activities', organizationName] as const,
  lists: (organizationName: string) => [...activityKeys.all(organizationName), 'list'] as const,
  list: (organizationName: string, filters?: ActivityFilters) => [...activityKeys.lists(organizationName), filters] as const,
  details: (organizationName: string) => [...activityKeys.all(organizationName), 'detail'] as const,
  detail: (organizationName: string, id: string) => [...activityKeys.details(organizationName), id] as const,
}

export const userKeys = {
  all: (organizationName: string) => ['users', organizationName] as const,
  lists: (organizationName: string) => [...userKeys.all(organizationName), 'list'] as const,
  list: (organizationName: string, params?: PaginationParams) => [...userKeys.lists(organizationName), params] as const,
  details: (organizationName: string) => [...userKeys.all(organizationName), 'detail'] as const,
  detail: (organizationName: string, id: string) => [...userKeys.details(organizationName), id] as const,
}

export const assignmentKeys = {
  all: (organizationName: string) => ['assignments', organizationName] as const,
  lists: (organizationName: string) => [...assignmentKeys.all(organizationName), 'list'] as const,
  list: (organizationName: string, params?: GetAssignmentsParams) => [...assignmentKeys.lists(organizationName), params] as const,
  details: (organizationName: string) => [...assignmentKeys.all(organizationName), 'detail'] as const,
  detail: (organizationName: string, id: string) => [...assignmentKeys.details(organizationName), id] as const,
}

export const configurationKeys = {
  all: (organizationName: string) => ['configuration', organizationName] as const,
  detail: (organizationName: string) => [...configurationKeys.all(organizationName), 'detail'] as const,
}
