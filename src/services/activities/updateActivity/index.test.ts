import { describe, it, expect } from 'vitest'
import { ForbiddenError } from '@/lib/api-server/errors'
import { updateActivity } from './'
import { createAdminUser, createGeneralUser, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const activityOwnedByOther = {
  id: 'act-1',
  userId: 'other-user-id',
  projectId: 'proj-1',
  startedAt: new Date('2024-06-01T09:00:00Z'),
  endedAt: null,
  note: null,
  createdAt: new Date('2024-06-01T09:00:00Z'),
  updatedAt: new Date('2024-06-01T09:00:00Z'),
  projectName: 'Test Project',
}

describe('updateActivity', () => {
  it('管理者は他人のアクティビティを更新できる', async () => {
    const updatedActivity = { ...activityOwnedByOther, note: 'updated' }
    const db = createMockDb({
      selectResult: [activityOwnedByOther],
      updateResult: [updatedActivity],
    })
    const result = await updateActivity(
      { db: db as unknown as DbOrTx },
      { type: 'user', user: createAdminUser() },
      { id: 'act-1', note: 'updated' },
    )
    expect(result).toMatchObject({ note: 'updated' })
  })

  it('一般ユーザーは他人のアクティビティを更新できない', async () => {
    const db = createMockDb({ selectResult: [activityOwnedByOther] })
    await expect(
      updateActivity({ db: db as unknown as DbOrTx }, { type: 'user', user: createGeneralUser() }, { id: 'act-1', note: 'updated' })
    ).rejects.toThrow(ForbiddenError)
  })
})
