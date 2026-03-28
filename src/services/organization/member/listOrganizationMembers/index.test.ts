import { describe, it, expect } from 'vitest'
import { listOrganizationMembers } from './'
import { createMockDb, createOwnerExecutor } from '../../../testing/helpers'
import type { DbOrTx } from '../../../types'

const memberRow = { id: 'assignment-1', userId: 'user-1', role: 'worker', createdAt: new Date(), userName: 'User 1', userIconUrl: null }

describe('listOrganizationMembers', () => {
  it('メンバー一覧を取得できる', async () => {
    const db = createMockDb({ selectResult: [memberRow] })
    const result = await listOrganizationMembers(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
    )
    expect(result).toMatchObject([{ id: 'assignment-1', userId: 'user-1' }])
  })

  it('メンバーがいない場合は空配列', async () => {
    const db = createMockDb({ selectResult: [] })
    const result = await listOrganizationMembers(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
    )
    expect(result).toEqual([])
  })
})
