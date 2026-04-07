import { describe, it, expect } from 'vitest'
import { listOrganizationMembers } from './'
import { createMockDb, createOwnerExecutor } from '../../../testing/helpers'
import type { DbOrTx } from '../../../types'

const memberRow = {
  id: 'assignment-1',
  email: 'user1@example.com',
  name: 'User 1',
  role: 'general',
  organizationRole: 'worker',
  iconUrl: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('listOrganizationMembers', () => {
  it('メンバー一覧を取得できる', async () => {
    const db = createMockDb({ selectResult: [memberRow] })
    const result = await listOrganizationMembers(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { limit: 10, offset: 0 },
    )
    expect(result).toHaveProperty('items')
    expect(result).toHaveProperty('count')
    expect(result.items[0]).toMatchObject({ id: 'assignment-1', email: 'user1@example.com' })
  })

  it('メンバーがいない場合は空配列', async () => {
    const db = createMockDb({ selectResult: [{ count: 0 }] })
    const result = await listOrganizationMembers(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { limit: 10, offset: 0 },
    )
    expect(result).toHaveProperty('items')
  })
})
