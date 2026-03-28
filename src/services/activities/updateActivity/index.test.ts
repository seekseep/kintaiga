import { describe, it, expect } from 'vitest'
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/api-server/errors'
import { updateActivity } from './'
import { createOwnerExecutor, createMemberExecutor, createMockDb } from '../../testing/helpers'
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
  userId: 'member-user-id',
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
      createOwnerExecutor(),
      { id: 'act-1', note: 'updated' },
    )
    expect(result).toMatchObject({ note: 'updated' })
  })

  it('一般ユーザーは自分のアクティビティを更新できる', async () => {
    const updatedActivity = { ...activityOwnedBySelf, note: 'my update' }
    const db = createMockDb({
      selectResult: [activityOwnedBySelf],
      updateResult: [updatedActivity],
    })
    const result = await updateActivity(
      { db: db as unknown as DbOrTx },
      createMemberExecutor(),
      { id: 'act-1', note: 'my update' },
    )
    expect(result).toMatchObject({ note: 'my update' })
  })

  it('startedAt を更新できる', async () => {
    const updatedActivity = { ...activityOwnedBySelf, startedAt: new Date('2024-07-01T10:00:00Z') }
    const db = createMockDb({
      selectResult: [activityOwnedBySelf],
      updateResult: [updatedActivity],
    })
    const result = await updateActivity(
      { db: db as unknown as DbOrTx },
      createMemberExecutor(),
      { id: 'act-1', startedAt: '2024-07-01T10:00:00Z' },
    )
    expect(result).toMatchObject({ startedAt: new Date('2024-07-01T10:00:00Z') })
  })

  it('endedAt を設定できる', async () => {
    const updatedActivity = { ...activityOwnedBySelf, endedAt: new Date('2024-06-01T17:00:00Z') }
    const db = createMockDb({
      selectResult: [activityOwnedBySelf],
      updateResult: [updatedActivity],
    })
    const result = await updateActivity(
      { db: db as unknown as DbOrTx },
      createMemberExecutor(),
      { id: 'act-1', endedAt: '2024-06-01T17:00:00Z' },
    )
    expect(result).toMatchObject({ endedAt: new Date('2024-06-01T17:00:00Z') })
  })

  it('endedAt を null にリセットできる', async () => {
    const updatedActivity = { ...activityOwnedBySelf, endedAt: null }
    const db = createMockDb({
      selectResult: [activityOwnedBySelf],
      updateResult: [updatedActivity],
    })
    const result = await updateActivity(
      { db: db as unknown as DbOrTx },
      createMemberExecutor(),
      { id: 'act-1', endedAt: null },
    )
    expect(result).toMatchObject({ endedAt: null })
  })

  it('一般ユーザーは他人のアクティビティを更新できない', async () => {
    const db = createMockDb({ selectResult: [activityOwnedByOther] })
    await expect(
      updateActivity({ db: db as unknown as DbOrTx }, createMemberExecutor(), { id: 'act-1', note: 'updated' })
    ).rejects.toThrow(ForbiddenError)
  })

  it('存在しないアクティビティは NotFoundError', async () => {
    const db = createMockDb({ selectResult: [] })
    await expect(
      updateActivity({ db: db as unknown as DbOrTx }, createOwnerExecutor(), { id: 'nonexistent', note: 'updated' })
    ).rejects.toThrow(NotFoundError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      updateActivity({ db: db as unknown as DbOrTx }, createOwnerExecutor(), { id: 123 } as unknown as { id: string })
    ).rejects.toThrow(ValidationError)
  })
})
