import { describe, it, expect, vi } from 'vitest'
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/api-server/errors'
import { createUserToken } from './'
import { createUserExecutor } from '../../../testing/helpers'
import type { DbOrTx } from '../../../types'

const organization = {
  id: 'organization-1',
  name: 'acme',
  displayName: 'Acme',
}

const createdToken = {
  id: 'token-1',
  userId: 'user-id',
  organizationId: 'organization-1',
  name: 'My Token',
  tokenHash: 'hash',
  prefix: 'kga_abcd',
  expiresAt: null,
  lastUsedAt: null,
  createdAt: new Date(),
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

function createMockDb(options?: {
  orgRows?: unknown[]
  membershipRows?: unknown[]
  insertResult?: unknown[]
}) {
  let selectCallCount = 0
  const selectResults = [
    options?.orgRows ?? [organization],
    options?.membershipRows ?? [{ id: 'assignment-1' }],
  ]
  return {
    select: vi.fn(() => {
      const result = selectResults[selectCallCount] ?? []
      selectCallCount++
      return createChain(result)
    }),
    insert: vi.fn(() => createChain(options?.insertResult ?? [createdToken])),
    update: vi.fn(() => createChain([])),
    delete: vi.fn(() => createChain([])),
  }
}

describe('createUserToken', () => {
  it('自分自身のトークンを作成できる', async () => {
    const db = createMockDb()
    const result = await createUserToken(
      { db: db as unknown as DbOrTx },
      createUserExecutor(),
      { userId: 'user-id', name: 'My Token', organizationName: 'acme' },
    )
    expect(result).toMatchObject({ id: 'token-1', name: 'My Token' })
    expect(result.token).toMatch(/^kga_/)
  })

  it('admin は他人のトークンを作成できる', async () => {
    const db = createMockDb()
    const result = await createUserToken(
      { db: db as unknown as DbOrTx },
      createUserExecutor({ user: { id: 'admin-id', role: 'admin' } }),
      { userId: 'other-user-id', name: 'Token', organizationName: 'acme' },
    )
    expect(result).toMatchObject({ id: 'token-1' })
  })

  it('admin は対象ユーザーがメンバーでなくてもトークンを作成できる', async () => {
    const db = createMockDb({ membershipRows: [] })
    const result = await createUserToken(
      { db: db as unknown as DbOrTx },
      createUserExecutor({ user: { id: 'admin-id', role: 'admin' } }),
      { userId: 'other-user-id', name: 'Token', organizationName: 'acme' },
    )
    expect(result).toMatchObject({ id: 'token-1' })
  })

  it('一般ユーザーは他人のトークンを作成できない', async () => {
    const db = createMockDb()
    await expect(
      createUserToken(
        { db: db as unknown as DbOrTx },
        createUserExecutor(),
        { userId: 'other-user-id', name: 'Token', organizationName: 'acme' },
      )
    ).rejects.toThrow(ForbiddenError)
  })

  it('一般ユーザーが組織のメンバーでない場合は ForbiddenError', async () => {
    const db = createMockDb({ membershipRows: [] })
    await expect(
      createUserToken(
        { db: db as unknown as DbOrTx },
        createUserExecutor(),
        { userId: 'user-id', name: 'Token', organizationName: 'acme' },
      )
    ).rejects.toThrow(ForbiddenError)
  })

  it('組織が存在しない場合は NotFoundError', async () => {
    const db = createMockDb({ orgRows: [] })
    await expect(
      createUserToken(
        { db: db as unknown as DbOrTx },
        createUserExecutor(),
        { userId: 'user-id', name: 'Token', organizationName: 'missing' },
      )
    ).rejects.toThrow(NotFoundError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      createUserToken(
        { db: db as unknown as DbOrTx },
        createUserExecutor(),
        { userId: 'user-id', name: '', organizationName: 'acme' },
      )
    ).rejects.toThrow(ValidationError)
  })
})
