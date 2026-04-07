import { describe, it, expect } from 'vitest'
import { getOrganizationConfiguration } from '.'
import { DEFAULT_GLOBAL_CONFIG } from '@/domain/project/configuration'
import { createOwnerExecutor, createMemberExecutor, createMockDb } from '../../../testing/helpers'
import type { DbOrTx } from '../../../types'

const existingConfig = {
  id: 'config-1',
  roundingInterval: 15,
  roundingDirection: 'ceil' as const,
  aggregationUnit: 'monthly' as const,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('getOrganizationConfiguration', () => {
  it('設定が存在する場合はそのまま返す', async () => {
    const db = createMockDb({ selectResult: [existingConfig] })
    const result = await getOrganizationConfiguration({ db: db as unknown as DbOrTx }, createOwnerExecutor())
    expect(result).toMatchObject({ roundingInterval: 15 })
  })

  it('一般ユーザーでも設定を取得できる', async () => {
    const db = createMockDb({ selectResult: [existingConfig] })
    const result = await getOrganizationConfiguration({ db: db as unknown as DbOrTx }, createMemberExecutor())
    expect(result).toMatchObject({ roundingInterval: 15 })
  })

  it('設定が存在しない場合はデフォルト定数を返す', async () => {
    const db = createMockDb({ selectResult: [] })
    const result = await getOrganizationConfiguration({ db: db as unknown as DbOrTx }, createOwnerExecutor())
    expect(result).toMatchObject(DEFAULT_GLOBAL_CONFIG)
  })
})
