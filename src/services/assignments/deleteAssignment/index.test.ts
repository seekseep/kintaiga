import { describe, it, expect } from 'vitest'
import { NotFoundError } from '@/lib/api-server/errors'
import { deleteAssignment } from './'
import { createAdminUser, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

describe('deleteAssignment', () => {
  it('存在しないアサインメントの削除は NotFoundError', async () => {
    const db = createMockDb({ deleteResult: [] })
    await expect(
      deleteAssignment({ db: db as unknown as DbOrTx }, { type: 'user', user: createAdminUser() }, { id: 'nonexistent' })
    ).rejects.toThrow(NotFoundError)
  })
})
