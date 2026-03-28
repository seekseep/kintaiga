import { describe, it, expect } from 'vitest'
import { ForbiddenError, ValidationError } from '@/lib/api-server/errors'
import { createUserToken } from './'
import { createMockDb, createOwnerExecutor, createAdminExecutor } from '../../../testing/helpers'
import type { DbOrTx } from '../../../types'

const createdToken = {
  id: 'token-1',
  userId: 'owner-user-id',
  organizationId: 'organization-1',
  name: 'My Token',
  tokenHash: 'hash',
  prefix: 'kga_abcd',
  expiresAt: null,
  lastUsedAt: null,
  createdAt: new Date(),
}

describe('createUserToken', () => {
  it('メンバーがトークンを作成できる', async () => {
    const membership = { id: 'assignment-1', organizationId: 'organization-1', userId: 'owner-user-id', role: 'owner' }
    const db = createMockDb({ selectResult: [membership], insertResult: [createdToken] })
    const result = await createUserToken(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { name: 'My Token' },
    )
    expect(result).toMatchObject({ id: 'token-1', name: 'My Token' })
    expect(result.token).toMatch(/^kga_/)
  })

  it('管理者はメンバーでなくてもトークンを作成できる', async () => {
    const db = createMockDb({ selectResult: [], insertResult: [createdToken] })
    const result = await createUserToken(
      { db: db as unknown as DbOrTx },
      createAdminExecutor(),
      { name: 'Admin Token' },
    )
    expect(result).toMatchObject({ id: 'token-1' })
  })

  it('メンバーでない一般ユーザーは ForbiddenError', async () => {
    const db = createMockDb({ selectResult: [] })
    await expect(
      createUserToken(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { name: 'Token' },
      )
    ).rejects.toThrow(ForbiddenError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      createUserToken(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { name: '' },
      )
    ).rejects.toThrow(ValidationError)
  })
})
