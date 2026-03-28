import { describe, it, expect } from 'vitest'
import { UnauthorizedError } from '@/lib/api-server/errors'
import { resolveUserToken } from './'
import { createMockDb } from '../../../testing/helpers'
import type { DbOrTx } from '../../../types'

const tokenRow = {
  tokenId: 'token-1',
  userId: 'user-1',
  organizationId: 'org-1',
  userRole: 'general',
  organizationPlan: 'free',
  role: 'owner',
}

describe('resolveUserToken', () => {
  it('有効なトークンを解決できる', async () => {
    const db = createMockDb({ selectResult: [tokenRow], updateResult: [] })
    const result = await resolveUserToken(
      { db: db as unknown as DbOrTx },
      'kga_some_raw_token_value',
    )
    expect(result).toMatchObject({
      tokenId: 'token-1',
      executor: {
        type: 'organization',
        user: { id: 'user-1', role: 'general' },
        organization: { id: 'org-1', role: 'owner', plan: 'free' },
      },
    })
  })

  it('無効なトークンは UnauthorizedError', async () => {
    const db = createMockDb({ selectResult: [] })
    await expect(
      resolveUserToken(
        { db: db as unknown as DbOrTx },
        'kga_invalid_token',
      )
    ).rejects.toThrow(UnauthorizedError)
  })
})
