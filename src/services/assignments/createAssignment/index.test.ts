import { describe, it, expect } from 'vitest'
import { ValidationError, ForbiddenError } from '@/lib/api-server/errors'
import { createAssignment } from './'
import { createAdminExecutor, createGeneralExecutor, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const createdAssignment = {
  id: 'asgn-1',
  projectId: 'proj-1',
  userId: 'user-1',
  startedAt: new Date('2024-01-01'),
  endedAt: null,
  targetMinutes: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('createAssignment', () => {
  it('アサインメントを作成できる', async () => {
    const db = createMockDb({ insertResult: [createdAssignment] })
    const result = await createAssignment(
      { db: db as unknown as DbOrTx },
      createAdminExecutor(),
      { projectId: 'proj-1', userId: 'user-1', startedAt: '2024-01-01T00:00:00' },
    )
    expect(result).toMatchObject({ id: 'asgn-1', projectId: 'proj-1', userId: 'user-1' })
  })

  it('targetMinutes を指定してアサインメントを作成できる', async () => {
    const withTarget = { ...createdAssignment, targetMinutes: 120 }
    const db = createMockDb({ insertResult: [withTarget] })
    const result = await createAssignment(
      { db: db as unknown as DbOrTx },
      createAdminExecutor(),
      { projectId: 'proj-1', userId: 'user-1', startedAt: '2024-01-01T00:00:00', targetMinutes: 120 },
    )
    expect(result).toMatchObject({ targetMinutes: 120 })
  })

  it('一般ユーザーはアサインメントを作成できない', async () => {
    const db = createMockDb()
    await expect(
      createAssignment(
        { db: db as unknown as DbOrTx },
        createGeneralExecutor(),
        { projectId: 'proj-1', userId: 'user-1', startedAt: '2024-01-01T00:00:00' },
      )
    ).rejects.toThrow(ForbiddenError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      createAssignment(
        { db: db as unknown as DbOrTx },
        createAdminExecutor(),
        { projectId: 123 } as unknown as { projectId: string; userId: string; startedAt: string },
      )
    ).rejects.toThrow(ValidationError)
  })

  it('targetMinutes が負の値は ValidationError', async () => {
    const db = createMockDb()
    await expect(
      createAssignment(
        { db: db as unknown as DbOrTx },
        createAdminExecutor(),
        { projectId: 'proj-1', userId: 'user-1', startedAt: '2024-01-01T00:00:00', targetMinutes: -1 },
      )
    ).rejects.toThrow(ValidationError)
  })
})
