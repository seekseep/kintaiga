import { describe, it, expect, vi } from 'vitest'
import { ValidationError, NotFoundError } from '@/lib/api-server/errors'
import { getProjectConfiguration } from './'
import { createAdminExecutor, createGeneralExecutor, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

vi.mock('@/domain/config', () => ({
  resolveProjectConfig: vi.fn((_config, _project) => ({
    roundingInterval: 15,
    roundingDirection: 'ceil',
    aggregationUnit: 'monthly',
  })),
}))

const projectRow = {
  id: 'proj-1',
  name: 'Test Project',
  description: null,
  roundingInterval: null,
  roundingDirection: null,
  aggregationUnit: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

const configRow = {
  id: 'config-1',
  roundingInterval: 15,
  roundingDirection: 'ceil',
  aggregationUnit: 'monthly',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
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

function createMockDbForConfig(projectRows: unknown[], configRows: unknown[]) {
  let selectCallCount = 0
  return {
    select: vi.fn(() => {
      selectCallCount++
      if (selectCallCount % 2 === 1) return createChain(projectRows)
      return createChain(configRows)
    }),
    insert: vi.fn(() => createChain([])),
    update: vi.fn(() => createChain([])),
    delete: vi.fn(() => createChain([])),
  }
}

describe('getProjectConfiguration', () => {
  it('プロジェクト設定を取得できる', async () => {
    const mockDb = createMockDbForConfig([projectRow], [configRow])
    const result = await getProjectConfiguration(
      { db: mockDb as unknown as DbOrTx },
      createAdminExecutor(),
      { id: 'proj-1' },
    )
    expect(result).toMatchObject({ roundingInterval: 15 })
  })

  it('一般ユーザーでもプロジェクト設定を取得できる', async () => {
    const mockDb = createMockDbForConfig([projectRow], [configRow])
    const result = await getProjectConfiguration(
      { db: mockDb as unknown as DbOrTx },
      createGeneralExecutor(),
      { id: 'proj-1' },
    )
    expect(result).toMatchObject({ roundingInterval: 15 })
  })

  it('プロジェクトが存在しない場合は NotFoundError', async () => {
    const mockDb = createMockDbForConfig([], [configRow])
    await expect(
      getProjectConfiguration(
        { db: mockDb as unknown as DbOrTx },
        createAdminExecutor(),
        { id: 'nonexistent' },
      )
    ).rejects.toThrow(NotFoundError)
  })

  it('設定が存在しない場合は NotFoundError', async () => {
    const mockDb = createMockDbForConfig([projectRow], [])
    await expect(
      getProjectConfiguration(
        { db: mockDb as unknown as DbOrTx },
        createAdminExecutor(),
        { id: 'proj-1' },
      )
    ).rejects.toThrow(NotFoundError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      getProjectConfiguration(
        { db: db as unknown as DbOrTx },
        createAdminExecutor(),
        { id: 123 } as unknown as { id: string },
      )
    ).rejects.toThrow(ValidationError)
  })
})
