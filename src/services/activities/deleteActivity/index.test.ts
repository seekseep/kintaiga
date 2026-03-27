import { describe, it, expect } from 'vitest'
import { ForbiddenError, NotFoundError } from '@/lib/api-server/errors'
import { deleteActivity } from './'
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

const activityOwnedBySelf = {
  ...activityOwnedByOther,
  userId: 'general-user-id',
}

describe('deleteActivity', () => {
  it('管理者は他人のアクティビティを削除できる', async () => {
    const db = createMockDb({ selectResult: [activityOwnedByOther] })
    await expect(
      deleteActivity({ db: db as unknown as DbOrTx }, { type: 'user', user: createAdminUser() }, { id: 'act-1' })
    ).resolves.not.toThrow()
  })

  it('一般ユーザーは自分のアクティビティを削除できる', async () => {
    const db = createMockDb({ selectResult: [activityOwnedBySelf] })
    await expect(
      deleteActivity({ db: db as unknown as DbOrTx }, { type: 'user', user: createGeneralUser() }, { id: 'act-1' })
    ).resolves.not.toThrow()
  })

  it('一般ユーザーは他人のアクティビティを削除できない', async () => {
    const db = createMockDb({ selectResult: [activityOwnedByOther] })
    await expect(
      deleteActivity({ db: db as unknown as DbOrTx }, { type: 'user', user: createGeneralUser() }, { id: 'act-1' })
    ).rejects.toThrow(ForbiddenError)
  })

  it('存在しないアクティビティは NotFoundError', async () => {
    const db = createMockDb({ selectResult: [] })
    await expect(
      deleteActivity({ db: db as unknown as DbOrTx }, { type: 'user', user: createAdminUser() }, { id: 'nonexistent' })
    ).rejects.toThrow(NotFoundError)
  })
})
