import { describe, it, expect } from 'vitest'
import { NotFoundError } from '@/lib/api-server/errors'
import { getAssignment } from './'
import { createAdminUser, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const existingAssignment = {
  id: 'assign-1',
  projectId: 'proj-1',
  userId: 'user-1',
  startedAt: new Date('2024-01-01'),
  endedAt: null,
  createdAt: new Date('2024-01-01'),
}

describe('getAssignment', () => {
  it('アサインメントが見つかる', async () => {
    const db = createMockDb({ selectResult: [existingAssignment] })
    const result = await getAssignment({ db: db as unknown as DbOrTx }, { type: 'user', user: createAdminUser() }, { id: 'assign-1' })
    expect(result).toMatchObject({ id: 'assign-1' })
  })

  it('存在しないアサインメントは NotFoundError', async () => {
    const db = createMockDb({ selectResult: [] })
    await expect(
      getAssignment({ db: db as unknown as DbOrTx }, { type: 'user', user: createAdminUser() }, { id: 'nonexistent' })
    ).rejects.toThrow(NotFoundError)
  })
})
