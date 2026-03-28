import { describe, it, expect } from 'vitest'
import { ValidationError } from '@/lib/api-server/errors'
import { listAssignments } from './'
import { createOwnerExecutor, createMemberExecutor, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const assignmentRow = {
  id: 'asgn-1',
  projectId: 'proj-1',
  userId: 'user-1',
  startedAt: new Date('2024-01-01'),
  endedAt: null,
  targetMinutes: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('listAssignments', () => {
  it('アサインメント一覧を取得できる', async () => {
    const db = createMockDb({ selectResult: [assignmentRow] })
    const result = await listAssignments(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { limit: 10, offset: 0 },
    )
    expect(result).toHaveProperty('items')
  })

  it('一般ユーザーでもアサインメント一覧を取得できる', async () => {
    const db = createMockDb({ selectResult: [assignmentRow] })
    const result = await listAssignments(
      { db: db as unknown as DbOrTx },
      createMemberExecutor(),
      { limit: 10, offset: 0 },
    )
    expect(result).toHaveProperty('items')
  })

  it('projectId でフィルタできる', async () => {
    const db = createMockDb({ selectResult: [assignmentRow] })
    const result = await listAssignments(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { limit: 10, offset: 0, projectId: 'proj-1' },
    )
    expect(result).toHaveProperty('items')
  })

  it('userId でフィルタできる', async () => {
    const db = createMockDb({ selectResult: [assignmentRow] })
    const result = await listAssignments(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { limit: 10, offset: 0, userId: 'user-1' },
    )
    expect(result).toHaveProperty('items')
  })

  it('active=true でアクティブなアサインメントをフィルタできる', async () => {
    const db = createMockDb({ selectResult: [assignmentRow] })
    const result = await listAssignments(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { limit: 10, offset: 0, active: 'true' },
    )
    expect(result).toHaveProperty('items')
  })

  it('active=false で非アクティブなアサインメントをフィルタできる', async () => {
    const db = createMockDb({ selectResult: [assignmentRow] })
    const result = await listAssignments(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { limit: 10, offset: 0, active: 'false' },
    )
    expect(result).toHaveProperty('items')
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      listAssignments(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { limit: 'bad', offset: 0 } as unknown as { limit: number; offset: number },
      )
    ).rejects.toThrow(ValidationError)
  })
})
