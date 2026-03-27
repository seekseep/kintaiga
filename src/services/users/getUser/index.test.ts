import { describe, it, expect } from 'vitest'
import { NotFoundError } from '@/lib/api-server/errors'
import { getUser } from './'
import { createAdminUser, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const targetUser = {
  id: 'target-user-id',
  name: 'Target',
  role: 'general' as const,
  iconUrl: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('getUser', () => {
  it('ユーザーが見つかる', async () => {
    const db = createMockDb({ selectResult: [targetUser] })
    const result = await getUser({ db: db as unknown as DbOrTx }, { type: 'user', user: createAdminUser() }, { id: 'target-user-id' })
    expect(result).toMatchObject({ id: 'target-user-id' })
  })

  it('存在しないユーザーは NotFoundError', async () => {
    const db = createMockDb({ selectResult: [] })
    await expect(
      getUser({ db: db as unknown as DbOrTx }, { type: 'user', user: createAdminUser() }, { id: 'nonexistent' })
    ).rejects.toThrow(NotFoundError)
  })
})
