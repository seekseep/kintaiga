import { describe, it, expect, vi } from 'vitest'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { updateOrganizationProjectConfiguration } from '.'
import { createOwnerExecutor, createMemberExecutor, createMockDb } from '../../../../testing/helpers'
import type { DbOrTx } from '../../../../types'

const projectRow = { id: 'proj-1', organizationId: 'organization-1' }
const configRow = { id: 'config-1', roundingInterval: 15, roundingDirection: 'ceil', aggregationUnit: 'monthly', aggregationPeriod: 1 }
const updatedRow = { roundingInterval: 30, roundingDirection: 'floor', aggregationUnit: 'weekly', aggregationPeriod: 2 }

function createChain(resolvedValue: unknown) {
  const methods = {
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
    set: vi.fn(),
    returning: vi.fn().mockResolvedValue(resolvedValue),
  }
  const chain = Object.assign(Promise.resolve(resolvedValue), methods)
  const self = () => chain
  methods.from.mockImplementation(self)
  methods.where.mockImplementation(self)
  methods.limit.mockImplementation(self)
  methods.set.mockImplementation(self)
  return chain
}

function createMockDbFor(projectRows: unknown[], configRows: unknown[], updateRows: unknown[]) {
  let selectCallCount = 0
  return {
    select: vi.fn(() => {
      selectCallCount++
      if (selectCallCount % 2 === 1) return createChain(projectRows)
      return createChain(configRows)
    }),
    update: vi.fn(() => createChain(updateRows)),
    insert: vi.fn(() => createChain([])),
    delete: vi.fn(() => createChain([])),
  }
}

describe('updateOrganizationProjectConfiguration', () => {
  it('設定を更新できる', async () => {
    const db = createMockDbFor([projectRow], [configRow], [updatedRow])
    const result = await updateOrganizationProjectConfiguration(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { id: 'proj-1', roundingInterval: 30, roundingDirection: 'floor', aggregationUnit: 'weekly', aggregationPeriod: 2 },
    )
    expect(result).toMatchObject({ roundingInterval: 30 })
  })

  it('プロジェクトが存在しない場合は NotFoundError', async () => {
    const db = createMockDbFor([], [], [])
    await expect(
      updateOrganizationProjectConfiguration(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { id: 'nonexistent' },
      ),
    ).rejects.toThrow(NotFoundError)
  })

  it('設定行が存在しない場合は NotFoundError', async () => {
    const db = createMockDbFor([projectRow], [], [])
    await expect(
      updateOrganizationProjectConfiguration(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { id: 'proj-1' },
      ),
    ).rejects.toThrow(NotFoundError)
  })

  it('権限がなければ ForbiddenError', async () => {
    const db = createMockDbFor([projectRow], [configRow], [updatedRow])
    await expect(
      updateOrganizationProjectConfiguration(
        { db: db as unknown as DbOrTx },
        createMemberExecutor(),
        { id: 'proj-1' },
      ),
    ).rejects.toThrow(ForbiddenError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      updateOrganizationProjectConfiguration(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { id: 'proj-1', roundingInterval: 7 },
      ),
    ).rejects.toThrow(ValidationError)
  })
})
