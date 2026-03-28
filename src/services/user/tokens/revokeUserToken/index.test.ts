import { describe, it, expect } from 'vitest'
import { NotFoundError, ForbiddenError, ValidationError } from '@/lib/api-server/errors'
import { revokeUserToken } from './'
import { createMockDb, createOwnerExecutor, createAdminExecutor } from '../../../testing/helpers'
import type { DbOrTx } from '../../../types'

const ownToken = { id: 'token-1', userId: 'owner-user-id', organizationId: 'organization-1', name: 'Token', tokenHash: 'hash', prefix: 'kga_abcd', expiresAt: null, lastUsedAt: null, createdAt: new Date() }
const otherToken = { ...ownToken, userId: 'other-user-id' }

describe('revokeUserToken', () => {
  it('トークンの所有者が取り消しできる', async () => {
    const db = createMockDb({ selectResult: [ownToken], deleteResult: [] })
    await expect(
      revokeUserToken(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { id: 'token-1' },
      )
    ).resolves.toBeUndefined()
  })

  it('管理者は他人のトークンを取り消しできる', async () => {
    const db = createMockDb({ selectResult: [otherToken], deleteResult: [] })
    await expect(
      revokeUserToken(
        { db: db as unknown as DbOrTx },
        createAdminExecutor(),
        { id: 'token-1' },
      )
    ).resolves.toBeUndefined()
  })

  it('他人のトークンは ForbiddenError', async () => {
    const db = createMockDb({ selectResult: [otherToken] })
    await expect(
      revokeUserToken(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { id: 'token-1' },
      )
    ).rejects.toThrow(ForbiddenError)
  })

  it('トークンが見つからない場合は NotFoundError', async () => {
    const db = createMockDb({ selectResult: [] })
    await expect(
      revokeUserToken(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { id: 'not-found' },
      )
    ).rejects.toThrow(NotFoundError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      revokeUserToken(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { id: 123 } as unknown as { id: string },
      )
    ).rejects.toThrow(ValidationError)
  })
})
