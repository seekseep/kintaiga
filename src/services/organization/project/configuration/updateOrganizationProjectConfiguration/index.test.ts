import { describe, it, expect, vi } from 'vitest'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { updateOrganizationProjectConfiguration } from '.'
import { createOwnerExecutor, createMemberExecutor, createMockDb } from '../../../../testing/helpers'
import type { DbOrTx } from '../../../../types'

const projectRow = {
  id: 'proj-1',
  organizationId: 'organization-1',
  roundingInterval: null,
  roundingDirection: null,
  aggregationUnit: null,
  aggregationPeriod: null,
}
const updatedRow = {
  id: 'proj-1',
  roundingInterval: 30,
  roundingDirection: 'floor',
  aggregationUnit: 'weekly',
  aggregationPeriod: 2,
}

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

function createMockDbFor(projectRows: unknown[], updateRows: unknown[]) {
  const setSpy = vi.fn()
  return {
    db: {
      select: vi.fn(() => createChain(projectRows)),
      update: vi.fn(() => {
        const chain = createChain(updateRows)
        chain.set.mockImplementation((values: unknown) => {
          setSpy(values)
          return chain
        })
        return chain
      }),
      insert: vi.fn(() => createChain([])),
      delete: vi.fn(() => createChain([])),
    },
    setSpy,
  }
}

describe('updateOrganizationProjectConfiguration', () => {
  it('設定を更新できる', async () => {
    const { db } = createMockDbFor([projectRow], [updatedRow])
    const result = await updateOrganizationProjectConfiguration(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { id: 'proj-1', roundingInterval: 30, roundingDirection: 'floor', aggregationUnit: 'weekly', aggregationPeriod: 2 },
    )
    expect(result).toEqual({
      roundingInterval: 30,
      roundingDirection: 'floor',
      aggregationUnit: 'weekly',
      aggregationPeriod: 2,
    })
  })

  it('null を渡すとカラムを null にクリアする', async () => {
    const { db, setSpy } = createMockDbFor([{ ...projectRow, roundingInterval: 15 }], [{ ...updatedRow, roundingInterval: null }])
    await updateOrganizationProjectConfiguration(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { id: 'proj-1', roundingInterval: null },
    )
    const setArg = setSpy.mock.calls[0][0]
    expect(setArg).toHaveProperty('roundingInterval', null)
    expect(setArg).not.toHaveProperty('roundingDirection')
  })

  it('未指定のキーは更新しない', async () => {
    const { db, setSpy } = createMockDbFor([projectRow], [updatedRow])
    await updateOrganizationProjectConfiguration(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { id: 'proj-1', roundingInterval: 30 },
    )
    const setArg = setSpy.mock.calls[0][0]
    expect(setArg).toHaveProperty('roundingInterval', 30)
    expect(setArg).not.toHaveProperty('roundingDirection')
    expect(setArg).not.toHaveProperty('aggregationUnit')
    expect(setArg).not.toHaveProperty('aggregationPeriod')
  })

  it('プロジェクトが存在しない場合は NotFoundError', async () => {
    const { db } = createMockDbFor([], [])
    await expect(
      updateOrganizationProjectConfiguration(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { id: 'nonexistent' },
      ),
    ).rejects.toThrow(NotFoundError)
  })

  it('権限がなければ ForbiddenError', async () => {
    const { db } = createMockDbFor([projectRow], [updatedRow])
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
