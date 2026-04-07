import { describe, it, expect, vi } from 'vitest'
import { ValidationError, NotFoundError } from '@/lib/api-server/errors'
import { getOrganizationProjectConfiguration } from '.'
import { DEFAULT_GLOBAL_CONFIG } from '@/domain/project/configuration'
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

const globalConfigRow = {
  id: 'config-1',
  organizationId: 'organization-1',
  roundingInterval: 15,
  roundingDirection: 'ceil',
  aggregationUnit: 'monthly',
  aggregationPeriod: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

function createSequencedSelectDb(results: unknown[][]) {
  const db = createMockDb()
  let index = 0
  ;(db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
    const result = results[index] ?? []
    index++
    const innerDb = createMockDb({ selectResult: result })
    return innerDb.select()
  })
  return db
}

describe('getOrganizationProjectConfiguration', () => {
  it('プロジェクトの設定値を取得できる', async () => {
    const db = createSequencedSelectDb([[projectRow], [globalConfigRow]])
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
    const db = createSequencedSelectDb([[projectRow], [globalConfigRow]])
    const result = await getOrganizationProjectConfiguration(
      { db: db as unknown as DbOrTx },
      createMemberExecutor(),
      { id: 'proj-1' },
    )
    expect(result.roundingInterval).toBe(30)
  })

  it('未設定カラムは組織のグローバル設定にフォールバックする', async () => {
    const db = createSequencedSelectDb([
      [{
        ...projectRow,
        roundingInterval: null,
        roundingDirection: null,
        aggregationUnit: null,
        aggregationPeriod: null,
      }],
      [globalConfigRow],
    ])
    const result = await getOrganizationProjectConfiguration(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { id: 'proj-1' },
    )
    expect(result).toEqual({
      roundingInterval: globalConfigRow.roundingInterval,
      roundingDirection: globalConfigRow.roundingDirection,
      aggregationUnit: globalConfigRow.aggregationUnit,
      aggregationPeriod: globalConfigRow.aggregationPeriod,
    })
  })

  it('グローバル設定も無い場合はデフォルト定数にフォールバックする', async () => {
    const db = createSequencedSelectDb([
      [{
        ...projectRow,
        roundingInterval: null,
        roundingDirection: null,
        aggregationUnit: null,
        aggregationPeriod: null,
      }],
      [],
    ])
    const result = await getOrganizationProjectConfiguration(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { id: 'proj-1' },
    )
    expect(result).toEqual(DEFAULT_GLOBAL_CONFIG)
  })

  it('プロジェクトが存在しない場合は NotFoundError', async () => {
    const db = createSequencedSelectDb([[]])
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
