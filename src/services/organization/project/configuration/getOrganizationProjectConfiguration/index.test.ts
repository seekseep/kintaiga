import { describe, it, expect } from 'vitest'
import { ValidationError, NotFoundError } from '@/lib/api-server/errors'
import { getOrganizationProjectConfiguration } from '.'
import { createOwnerExecutor, createMemberExecutor, createMockDb } from '../../../../testing/helpers'
import type { DbOrTx } from '../../../../types'

const projectRow = {
  id: 'proj-1',
  organizationId: 'organization-1',
  name: 'Test Project',
  description: null,
  roundingInterval: 30,
  roundingDirection: 'floor',
  aggregationUnit: 'weekly',
  aggregationPeriod: 2,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('getOrganizationProjectConfiguration', () => {
  it('プロジェクトの設定値を取得できる', async () => {
    const db = createMockDb({ selectResult: [projectRow] })
    const result = await getOrganizationProjectConfiguration(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { id: 'proj-1' },
    )
    expect(result).toEqual({
      roundingInterval: 30,
      roundingDirection: 'floor',
      aggregationUnit: 'weekly',
      aggregationPeriod: 2,
    })
  })

  it('組織メンバー(worker)でも取得できる', async () => {
    const db = createMockDb({ selectResult: [projectRow] })
    const result = await getOrganizationProjectConfiguration(
      { db: db as unknown as DbOrTx },
      createMemberExecutor(),
      { id: 'proj-1' },
    )
    expect(result.roundingInterval).toBe(30)
  })

  it('未設定カラムは null のまま返す', async () => {
    const db = createMockDb({
      selectResult: [{
        ...projectRow,
        roundingInterval: null,
        roundingDirection: null,
        aggregationUnit: null,
        aggregationPeriod: null,
      }],
    })
    const result = await getOrganizationProjectConfiguration(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { id: 'proj-1' },
    )
    expect(result).toEqual({
      roundingInterval: null,
      roundingDirection: null,
      aggregationUnit: null,
      aggregationPeriod: null,
    })
  })

  it('プロジェクトが存在しない場合は NotFoundError', async () => {
    const db = createMockDb({ selectResult: [] })
    await expect(
      getOrganizationProjectConfiguration(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { id: 'nonexistent' },
      ),
    ).rejects.toThrow(NotFoundError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      getOrganizationProjectConfiguration(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { id: 123 } as unknown as { id: string },
      ),
    ).rejects.toThrow(ValidationError)
  })

})
