import { describe, it, expect } from 'vitest'
import { getConfiguration } from './'
import { createOwnerExecutor, createMemberExecutor, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const existingConfig = {
  id: 'config-1',
  roundingInterval: 15,
  roundingDirection: 'ceil' as const,
  aggregationUnit: 'monthly' as const,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('getConfiguration', () => {
  it('設定が存在する場合はそのまま返す', async () => {
    const db = createMockDb({ selectResult: [existingConfig] })
    const result = await getConfiguration({ db: db as unknown as DbOrTx }, createOwnerExecutor())
    expect(result).toMatchObject({ roundingInterval: 15 })
  })

  it('一般ユーザーでも設定を取得できる', async () => {
    const db = createMockDb({ selectResult: [existingConfig] })
    const result = await getConfiguration({ db: db as unknown as DbOrTx }, createMemberExecutor())
    expect(result).toMatchObject({ roundingInterval: 15 })
  })

  it('設定が存在しない場合は新規作成する', async () => {
    const newConfig = { ...existingConfig, id: 'new-config' }
    const selectChain = Object.assign(
      Promise.resolve([]),
      {
        from: () => selectChain,
        where: () => selectChain,
        limit: () => selectChain,
      },
    )
    const insertChain = {
      values: () => insertChain,
      returning: () => Promise.resolve([newConfig]),
    }
    const db = {
      select: () => selectChain,
      insert: () => insertChain,
    }
    const result = await getConfiguration({ db: db as unknown as DbOrTx }, createOwnerExecutor())
    expect(result).toMatchObject({ id: 'new-config' })
  })
})
