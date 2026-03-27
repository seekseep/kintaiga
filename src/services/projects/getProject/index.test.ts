import { describe, it, expect } from 'vitest'
import { NotFoundError } from '@/lib/api-server/errors'
import { getProject } from './'
import { createAdminUser, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const existingProject = {
  id: 'proj-1',
  name: 'Test Project',
  description: null,
  roundingInterval: null,
  roundingDirection: null,
  aggregationUnit: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('getProject', () => {
  it('プロジェクトが見つかる', async () => {
    const db = createMockDb({ selectResult: [existingProject] })
    const result = await getProject({ db: db as unknown as DbOrTx }, { type: 'user', user: createAdminUser() }, { id: 'proj-1' })
    expect(result).toMatchObject({ id: 'proj-1', name: 'Test Project' })
  })

  it('存在しないプロジェクトは NotFoundError', async () => {
    const db = createMockDb({ selectResult: [] })
    await expect(
      getProject({ db: db as unknown as DbOrTx }, { type: 'user', user: createAdminUser() }, { id: 'nonexistent' })
    ).rejects.toThrow(NotFoundError)
  })
})
