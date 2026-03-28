import { describe, it, expect } from 'vitest'
import { ValidationError } from '@/lib/api-server/errors'
import { listActivities } from './'
import { createOwnerExecutor, createMemberExecutor, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const activityRow = {
  id: 'act-1',
  userId: 'general-user-id',
  projectId: 'proj-1',
  startedAt: new Date('2024-06-01T09:00:00Z'),
  endedAt: null,
  note: null,
  createdAt: new Date('2024-06-01T09:00:00Z'),
  updatedAt: new Date('2024-06-01T09:00:00Z'),
  projectName: 'Test Project',
  userName: 'General',
}

describe('listActivities', () => {
  it('管理者は全アクティビティを取得できる', async () => {
    const db = createMockDb({ selectResult: [activityRow] })
    const result = await listActivities(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { limit: 10, offset: 0 },
    )
    expect(result).toMatchObject({ items: [activityRow], count: undefined })
  })

  it('一般ユーザーは自分のアクティビティのみ取得される', async () => {
    const db = createMockDb({ selectResult: [activityRow] })
    const result = await listActivities(
      { db: db as unknown as DbOrTx },
      createMemberExecutor(),
      { limit: 10, offset: 0 },
    )
    expect(result).toHaveProperty('items')
  })

  it('管理者が userId でフィルタできる', async () => {
    const db = createMockDb({ selectResult: [activityRow] })
    const result = await listActivities(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { limit: 10, offset: 0, userId: 'general-user-id' },
    )
    expect(result).toHaveProperty('items')
  })

  it('ongoing フィルタを指定できる', async () => {
    const db = createMockDb({ selectResult: [activityRow] })
    const result = await listActivities(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { limit: 10, offset: 0, ongoing: true },
    )
    expect(result).toHaveProperty('items')
  })

  it('projectId フィルタを指定できる', async () => {
    const db = createMockDb({ selectResult: [activityRow] })
    const result = await listActivities(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { limit: 10, offset: 0, projectId: 'proj-1' },
    )
    expect(result).toHaveProperty('items')
  })

  it('startDate / endDate フィルタを指定できる', async () => {
    const db = createMockDb({ selectResult: [activityRow] })
    const result = await listActivities(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { limit: 10, offset: 0, startDate: '2024-01-01', endDate: '2024-12-31' },
    )
    expect(result).toHaveProperty('items')
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      listActivities(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { limit: 'bad', offset: 0 } as unknown as { limit: number; offset: number },
      )
    ).rejects.toThrow(ValidationError)
  })
})
