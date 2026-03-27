import { describe, it, expect } from 'vitest'
import { NotFoundError } from '@/lib/api-server/errors'
import { updateProject } from './'
import { createAdminUser, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

describe('updateProject', () => {
  it('存在しないプロジェクトの更新は NotFoundError', async () => {
    const db = createMockDb({ updateResult: [] })
    await expect(
      updateProject({ db: db as unknown as DbOrTx }, { type: 'user', user: createAdminUser() }, { id: 'nonexistent', name: 'Updated' })
    ).rejects.toThrow(NotFoundError)
  })
})
