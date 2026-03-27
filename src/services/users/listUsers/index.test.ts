import { describe, it, expect } from 'vitest'
import { ValidationError } from '@/lib/api-server/errors'
import { listUsers } from './'
import { createAdminExecutor, createGeneralExecutor, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const userRow = {
  id: 'user-1',
  name: 'User 1',
  role: 'general',
  iconUrl: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('listUsers', () => {
  it('ユーザー一覧を取得できる', async () => {
    const db = createMockDb({ selectResult: [userRow] })
    const result = await listUsers(
      { db: db as unknown as DbOrTx },
      createAdminExecutor(),
      { limit: 10, offset: 0 },
    )
    expect(result).toHaveProperty('items')
    expect(result).toHaveProperty('count')
  })

  it('一般ユーザーでもユーザー一覧を取得できる', async () => {
    const db = createMockDb({ selectResult: [userRow] })
    const result = await listUsers(
      { db: db as unknown as DbOrTx },
      createGeneralExecutor(),
      { limit: 10, offset: 0 },
    )
    expect(result).toHaveProperty('items')
  })

  it('空の結果を返せる', async () => {
    const db = createMockDb({ selectResult: [{ count: 0 }] })
    const result = await listUsers(
      { db: db as unknown as DbOrTx },
      createAdminExecutor(),
      { limit: 10, offset: 0 },
    )
    expect(result).toHaveProperty('items')
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      listUsers(
        { db: db as unknown as DbOrTx },
        createAdminExecutor(),
        { limit: 'bad', offset: 0 } as unknown as { limit: number; offset: number },
      )
    ).rejects.toThrow(ValidationError)
  })
})
