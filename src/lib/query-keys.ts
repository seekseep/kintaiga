import type { GetOrganizationUserProjectStatementsParameters } from '@/api/organization/project'
import type { PaginationParameters } from '@/api/types'
import type { ListOrganizationProjectMembersParameters } from '@/api/organization/project/member'

export type ActivityFilters = {
  userId?: string
  ongoing?: boolean
  projectId?: string
  startDate?: string
  endDate?: string
}

export const organizationRootKey = (organizationName: string) =>
  ['organization', organizationName] as const

export const meKeys = {
  all: ['me'] as const,
  profile: () => [...meKeys.all, 'profile'] as const,
  organizations: () => [...meKeys.all, 'organizations'] as const,
  tokens: () => [...meKeys.all, 'tokens'] as const,
}

export const organizationKeys = {
  all: (organizationName: string) => [...organizationRootKey(organizationName)] as const,
  detail: (organizationName: string) => [...organizationRootKey(organizationName), 'detail'] as const,
  members: (organizationName: string) => [...organizationRootKey(organizationName), 'members'] as const,
}

export const projectKeys = {
  all: (organizationName: string) => [...organizationRootKey(organizationName), 'projects'] as const,
  lists: (organizationName: string) => [...projectKeys.all(organizationName), 'list'] as const,
  statements: (organizationName: string) => [...projectKeys.all(organizationName), 'statement'] as const,
  statement: (organizationName: string, parameters?: GetOrganizationUserProjectStatementsParameters) => [...projectKeys.statements(organizationName), parameters] as const,
  details: (organizationName: string) => [...projectKeys.all(organizationName), 'detail'] as const,
  detail: (organizationName: string, id: string) => [...projectKeys.details(organizationName), id] as const,
  config: (organizationName: string, id: string) => [...projectKeys.detail(organizationName, id), 'config'] as const,
  assignments: (organizationName: string, id: string) => [...projectKeys.detail(organizationName, id), 'assignments'] as const,
  members: (organizationName: string, id: string) => [...projectKeys.detail(organizationName, id), 'members'] as const,
}

export const activityKeys = {
  all: (organizationName: string) => [...organizationRootKey(organizationName), 'activities'] as const,
  lists: (organizationName: string) => [...activityKeys.all(organizationName), 'list'] as const,
  list: (organizationName: string, filters?: ActivityFilters) => [...activityKeys.lists(organizationName), filters] as const,
  details: (organizationName: string) => [...activityKeys.all(organizationName), 'detail'] as const,
  detail: (organizationName: string, id: string) => [...activityKeys.details(organizationName), id] as const,
}

export const memberKeys = {
  all: (organizationName: string) => [...organizationRootKey(organizationName), 'members'] as const,
  lists: (organizationName: string) => [...memberKeys.all(organizationName), 'list'] as const,
  list: (organizationName: string, parameters?: PaginationParameters) => [...memberKeys.lists(organizationName), parameters] as const,
  details: (organizationName: string) => [...memberKeys.all(organizationName), 'detail'] as const,
  detail: (organizationName: string, id: string) => [...memberKeys.details(organizationName), id] as const,
}

export const projectMemberKeys = {
  all: (organizationName: string) => [...organizationRootKey(organizationName), 'projectMembers'] as const,
  lists: (organizationName: string) => [...projectMemberKeys.all(organizationName), 'list'] as const,
  list: (organizationName: string, parameters?: ListOrganizationProjectMembersParameters) => [...projectMemberKeys.lists(organizationName), parameters] as const,
  details: (organizationName: string) => [...projectMemberKeys.all(organizationName), 'detail'] as const,
  detail: (organizationName: string, id: string) => [...projectMemberKeys.details(organizationName), id] as const,
}

export const configurationKeys = {
  all: (organizationName: string) => [...organizationRootKey(organizationName), 'configuration'] as const,
  detail: (organizationName: string) => [...configurationKeys.all(organizationName), 'detail'] as const,
}
