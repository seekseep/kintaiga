import { describe, it, expect } from 'vitest'
import { ValidationError } from '@/lib/api-server/errors'
import { listOrganizationActivities } from './'
import { createMockDb, createOwnerExecutor, createMemberExecutor } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const activityRow = {
  id: 'activity-1',
  userId: 'member-user-id',
  projectId: 'project-1',
  startedAt: new Date('2024-01-01T09:00:00'),
  endedAt: new Date('2024-01-01T17:00:00'),
  note: 'Work',
  createdAt: new Date(),
  updatedAt: new Date(),
  projectName: 'Project 1',
  userName: 'User 1',
}

describe('listOrganizationActivities', () => {
  it('マネージャーが全アクティビティを取得できる', async () => {
    const db = createMockDb({ selectResult: [activityRow] })
    const result = await listOrganizationActivities(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      {},
    )
    expect(result).toMatchObject({ items: [activityRow], limit: 50, offset: 0 })
  })

  it('一般メンバーは自分のアクティビティのみ取得される', async () => {
    const db = createMockDb({ selectResult: [activityRow] })
    const result = await listOrganizationActivities(
      { db: db as unknown as DbOrTx },
      createMemberExecutor(),
      {},
    )
    expect(result).toMatchObject({ items: [activityRow] })
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      listOrganizationActivities(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { limit: 'invalid' } as unknown as { limit: number },
      )
    ).rejects.toThrow(ValidationError)
  })
})
