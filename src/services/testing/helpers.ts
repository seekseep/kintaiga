import { vi } from 'vitest'
import type { UserExecutor, OrganizationExecutor, SystemExecutor } from '../types'

export function createSystemExecutor(overrides?: Partial<SystemExecutor>): SystemExecutor {
  return {
    type: 'system',
    ...overrides,
  }
}

export function createUserExecutor(overrides?: {
  user?: Partial<UserExecutor['user']>
}): UserExecutor {
  return {
    type: 'user',
    user: { id: 'user-id', role: 'general', ...overrides?.user },
  }
}

export function createAdminExecutor(overrides?: {
  user?: Partial<OrganizationExecutor['user']>
  organization?: Partial<OrganizationExecutor['organization']>
}): OrganizationExecutor {
  return {
    type: 'organization',
    user: { id: 'admin-user-id', role: 'admin', ...overrides?.user },
    organization: { id: 'organization-1', role: 'owner', plan: 'free', ...overrides?.organization },
  }
}

export function createGeneralExecutor(overrides?: {
  user?: Partial<OrganizationExecutor['user']>
  organization?: Partial<OrganizationExecutor['organization']>
}): OrganizationExecutor {
  return {
    type: 'organization',
    user: { id: 'general-user-id', role: 'general', ...overrides?.user },
    organization: { id: 'organization-1', role: 'worker', plan: 'free', ...overrides?.organization },
  }
}

export function createOwnerExecutor(overrides?: {
  user?: Partial<OrganizationExecutor['user']>
  organization?: Partial<OrganizationExecutor['organization']>
}): OrganizationExecutor {
  return {
    type: 'organization',
    user: { id: 'owner-user-id', role: 'general', ...overrides?.user },
    organization: { id: 'organization-1', role: 'owner', plan: 'free', ...overrides?.organization },
  }
}

export function createManagerExecutor(overrides?: {
  user?: Partial<OrganizationExecutor['user']>
  organization?: Partial<OrganizationExecutor['organization']>
}): OrganizationExecutor {
  return {
    type: 'organization',
    user: { id: 'manager-user-id', role: 'general', ...overrides?.user },
    organization: { id: 'organization-1', role: 'manager', plan: 'free', ...overrides?.organization },
  }
}

export function createMemberExecutor(overrides?: {
  user?: Partial<OrganizationExecutor['user']>
  organization?: Partial<OrganizationExecutor['organization']>
}): OrganizationExecutor {
  return {
    type: 'organization',
    user: { id: 'member-user-id', role: 'general', ...overrides?.user },
    organization: { id: 'organization-1', role: 'worker', plan: 'free', ...overrides?.organization },
  }
}


function createChain(resolvedValue: unknown) {
  const methods = {
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
    offset: vi.fn(),
    orderBy: vi.fn(),
    leftJoin: vi.fn(),
    innerJoin: vi.fn(),
    set: vi.fn(),
    values: vi.fn(),
    returning: vi.fn().mockResolvedValue(resolvedValue),
  }
  const chain = Object.assign(Promise.resolve(resolvedValue), methods)
  const self = () => chain
  methods.from.mockImplementation(self)
  methods.where.mockImplementation(self)
  methods.limit.mockImplementation(self)
  methods.offset.mockImplementation(self)
  methods.orderBy.mockImplementation(self)
  methods.leftJoin.mockImplementation(self)
  methods.innerJoin.mockImplementation(self)
  methods.set.mockImplementation(self)
  methods.values.mockImplementation(self)
  return chain
}

export function createMockDb(overrides?: {
  selectResult?: unknown
  insertResult?: unknown
  updateResult?: unknown
  deleteResult?: unknown
}) {
  return {
    select: vi.fn(() => createChain(overrides?.selectResult ?? [])),
    insert: vi.fn(() => createChain(overrides?.insertResult ?? [])),
    update: vi.fn(() => createChain(overrides?.updateResult ?? [])),
    delete: vi.fn(() => createChain(overrides?.deleteResult ?? [])),
  }
}
