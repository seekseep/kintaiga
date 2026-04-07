import { describe, it, expect } from 'vitest'
import { ForbiddenError, ValidationError } from '@/lib/api-server/errors'
import { listUserTokens } from './'
import { createMockDb, createUserExecutor } from '../../../testing/helpers'
import type { DbOrTx } from '../../../types'

const tokenRow = {
  id: 'token-1',
  name: 'My Token',
  prefix: 'kga_abcd',
  organizationId: 'organization-1',
  organizationName: 'acme',
  organizationDisplayName: 'Acme',
  expiresAt: null,
  lastUsedAt: null,
  createdAt: new Date(),
}

describe('listUserTokens', () => {
  it('自分のトークン一覧を取得できる', async () => {
    const db = createMockDb({ selectResult: [tokenRow] })
    const result = await listUserTokens(
      { db: db as unknown as DbOrTx },
      createUserExecutor(),
      { userId: 'user-id' },
    )
    expect(result).toMatchObject({ items: [{ id: 'token-1', name: 'My Token' }] })
  })

  it('admin は他人のトークン一覧を取得できる', async () => {
    const db = createMockDb({ selectResult: [tokenRow] })
    const result = await listUserTokens(
      { db: db as unknown as DbOrTx },
      createUserExecutor({ user: { id: 'admin-id', role: 'admin' } }),
      { userId: 'other-user-id' },
    )
    expect(result).toMatchObject({ items: [{ id: 'token-1' }] })
  })

  it('一般ユーザーは他人のトークン一覧を取得できない', async () => {
    const db = createMockDb()
    await expect(
      listUserTokens(
        { db: db as unknown as DbOrTx },
        createUserExecutor(),
        { userId: 'other-user-id' },
      )
    ).rejects.toThrow(ForbiddenError)
  })

  it('organizationId でフィルターできる', async () => {
    const db = createMockDb({ selectResult: [tokenRow] })
    const result = await listUserTokens(
      { db: db as unknown as DbOrTx },
      createUserExecutor(),
      { userId: 'user-id', organizationId: 'organization-1' },
    )
    expect(result).toMatchObject({ items: [{ id: 'token-1' }] })
  })

  it('トークンがない場合は空配列', async () => {
    const db = createMockDb({ selectResult: [] })
    const result = await listUserTokens(
      { db: db as unknown as DbOrTx },
      createUserExecutor(),
      { userId: 'user-id' },
    )
    expect(result).toMatchObject({ items: [] })
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      listUserTokens(
        { db: db as unknown as DbOrTx },
        createUserExecutor(),
        { userId: '' },
      )
    ).rejects.toThrow(ValidationError)
  })
})
