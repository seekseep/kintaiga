import { describe, it, expect } from 'vitest'
import { ForbiddenError, ValidationError } from '@/lib/api-server/errors'
import { createActivity } from './'
import { createAdminExecutor, createGeneralExecutor, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const assignmentRow = {
  id: 'asgn-1',
  projectId: 'proj-1',
  userId: 'general-user-id',
  startedAt: new Date('2024-01-01'),
  endedAt: null,
  targetMinutes: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

const createdActivity = {
  id: 'act-1',
  userId: 'general-user-id',
  projectId: 'proj-1',
  startedAt: new Date('2024-06-01T09:00:00Z'),
  endedAt: null,
  note: null,
  createdAt: new Date('2024-06-01T09:00:00Z'),
  updatedAt: new Date('2024-06-01T09:00:00Z'),
}

describe('createActivity', () => {
  it('一般ユーザーがアサイン済みプロジェクトでアクティビティを作成できる', async () => {
    const db = createMockDb({ selectResult: [assignmentRow], insertResult: [createdActivity] })
    const result = await createActivity(
      { db: db as unknown as DbOrTx },
      createGeneralExecutor(),
      { projectId: 'proj-1' },
    )
    expect(result).toMatchObject({ id: 'act-1', projectId: 'proj-1' })
  })

  it('管理者が他のユーザーの代理でアクティビティを作成できる', async () => {
    const adminAssignment = { ...assignmentRow, userId: 'other-user-id' }
    const db = createMockDb({ selectResult: [adminAssignment], insertResult: [{ ...createdActivity, userId: 'other-user-id' }] })
    const result = await createActivity(
      { db: db as unknown as DbOrTx },
      createAdminExecutor(),
      { projectId: 'proj-1', userId: 'other-user-id' },
    )
    expect(result).toMatchObject({ userId: 'other-user-id' })
  })

  it('一般ユーザーが userId を指定しても自分の ID が使われる', async () => {
    const db = createMockDb({ selectResult: [assignmentRow], insertResult: [createdActivity] })
    const result = await createActivity(
      { db: db as unknown as DbOrTx },
      createGeneralExecutor(),
      { projectId: 'proj-1', userId: 'other-user-id' },
    )
    expect(result).toMatchObject({ userId: 'general-user-id' })
  })

  it('startedAt を指定してアクティビティを作成できる', async () => {
    const db = createMockDb({ selectResult: [assignmentRow], insertResult: [createdActivity] })
    const result = await createActivity(
      { db: db as unknown as DbOrTx },
      createGeneralExecutor(),
      { projectId: 'proj-1', startedAt: '2024-06-01T09:00:00Z' },
    )
    expect(result).toMatchObject({ id: 'act-1' })
  })

  it('note を指定してアクティビティを作成できる', async () => {
    const activityWithNote = { ...createdActivity, note: 'テストメモ' }
    const db = createMockDb({ selectResult: [assignmentRow], insertResult: [activityWithNote] })
    const result = await createActivity(
      { db: db as unknown as DbOrTx },
      createGeneralExecutor(),
      { projectId: 'proj-1', note: 'テストメモ' },
    )
    expect(result).toMatchObject({ note: 'テストメモ' })
  })

  it('アサインされていないプロジェクトでは ForbiddenError', async () => {
    const db = createMockDb({ selectResult: [] })
    await expect(
      createActivity(
        { db: db as unknown as DbOrTx },
        createGeneralExecutor(),
        { projectId: 'proj-999' },
      )
    ).rejects.toThrow(ForbiddenError)
  })

  it('不正な startedAt は ValidationError', async () => {
    const db = createMockDb({ selectResult: [assignmentRow], insertResult: [createdActivity] })
    await expect(
      createActivity(
        { db: db as unknown as DbOrTx },
        createGeneralExecutor(),
        { projectId: 'proj-1', startedAt: 'invalid-date' },
      )
    ).rejects.toThrow(ValidationError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      createActivity(
        { db: db as unknown as DbOrTx },
        createGeneralExecutor(),
        { projectId: 123 } as unknown as { projectId: string },
      )
    ).rejects.toThrow(ValidationError)
  })
})
