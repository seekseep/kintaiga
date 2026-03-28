import { describe, it, expect } from 'vitest'
import { listUserTokens } from './'
import { createMockDb, createOwnerExecutor } from '../../../testing/helpers'
import type { DbOrTx } from '../../../types'

const tokenRow = {
  id: 'token-1',
  name: 'My Token',
  prefix: 'kga_abcd',
  expiresAt: null,
  lastUsedAt: null,
  createdAt: new Date(),
}

describe('listUserTokens', () => {
  it('トークン一覧を取得できる', async () => {
    const db = createMockDb({ selectResult: [tokenRow] })
    const result = await listUserTokens(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
    )
    expect(result).toMatchObject({ items: [{ id: 'token-1', name: 'My Token' }] })
  })

  it('トークンがない場合は空配列', async () => {
    const db = createMockDb({ selectResult: [] })
    const result = await listUserTokens(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
    )
    expect(result).toMatchObject({ items: [] })
  })
})
