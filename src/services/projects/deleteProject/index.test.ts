import { describe, it, expect } from 'vitest'
import { NotFoundError } from '@/lib/api-server/errors'
import { deleteProject } from './'
import { createAdminUser, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

describe('deleteProject', () => {
  it('存在しないプロジェクトの削除は NotFoundError', async () => {
    const db = createMockDb({ deleteResult: [] })
    await expect(
      deleteProject({ db: db as unknown as DbOrTx }, { type: 'user', user: createAdminUser() }, { id: 'nonexistent' })
    ).rejects.toThrow(NotFoundError)
  })
})
