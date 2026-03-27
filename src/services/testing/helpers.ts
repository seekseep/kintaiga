import { vi } from 'vitest'
import type { Executor } from '../types'

export function createAdminExecutor(overrides?: Partial<Executor>): Executor {
  return {
    id: 'admin-user-id',
    role: 'admin',
    ...overrides,
  }
}

export function createGeneralExecutor(overrides?: Partial<Executor>): Executor {
  return {
    id: 'general-user-id',
    role: 'general',
    ...overrides,
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
