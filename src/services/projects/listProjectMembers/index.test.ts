import { describe, it, expect } from 'vitest'
import { listProjectMembers } from './'
import { createAdminExecutor, createGeneralExecutor, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const activeMemberRow = {
  assignmentId: 'asgn-1',
  userId: 'user-1',
  name: 'User 1',
  role: 'general',
  iconUrl: null,
  targetMinutes: 60,
  startedAt: new Date('2024-01-01'),
  endedAt: null,
}

const suspendedMemberRow = {
  assignmentId: 'asgn-2',
  userId: 'user-2',
  name: 'User 2',
  role: 'general',
  iconUrl: null,
  targetMinutes: null,
  startedAt: new Date('2024-01-01'),
  endedAt: new Date('2024-03-01'),
}

const futureSuspendedMemberRow = {
  assignmentId: 'asgn-3',
  userId: 'user-3',
  name: 'User 3',
  role: 'general',
  iconUrl: null,
  targetMinutes: null,
  startedAt: new Date('2024-01-01'),
  endedAt: new Date('2099-12-31'),
}

describe('listProjectMembers', () => {
  it('プロジェクトメンバー一覧を取得できる', async () => {
    const db = createMockDb({ selectResult: [activeMemberRow] })
    const result = await listProjectMembers(
      { db: db as unknown as DbOrTx },
      createAdminExecutor(),
      { projectId: 'proj-1' },
    )
    expect(result.items).toHaveLength(1)
    expect(result.items[0]).toMatchObject({
      assignmentId: 'asgn-1',
      userId: 'user-1',
      active: true,
    })
  })

  it('一般ユーザーでもプロジェクトメンバーを取得できる', async () => {
    const db = createMockDb({ selectResult: [activeMemberRow] })
    const result = await listProjectMembers(
      { db: db as unknown as DbOrTx },
      createGeneralExecutor(),
      { projectId: 'proj-1' },
    )
    expect(result.items).toHaveLength(1)
  })

  it('endedAt が null のメンバーは active: true', async () => {
    const db = createMockDb({ selectResult: [activeMemberRow] })
    const result = await listProjectMembers(
      { db: db as unknown as DbOrTx },
      createAdminExecutor(),
      { projectId: 'proj-1' },
    )
    expect(result.items[0].active).toBe(true)
  })

  it('endedAt が過去のメンバーは active: false', async () => {
    const db = createMockDb({ selectResult: [suspendedMemberRow] })
    const result = await listProjectMembers(
      { db: db as unknown as DbOrTx },
      createAdminExecutor(),
      { projectId: 'proj-1' },
    )
    expect(result.items[0].active).toBe(false)
  })

  it('endedAt が未来のメンバーは active: true', async () => {
    const db = createMockDb({ selectResult: [futureSuspendedMemberRow] })
    const result = await listProjectMembers(
      { db: db as unknown as DbOrTx },
      createAdminExecutor(),
      { projectId: 'proj-1' },
    )
    expect(result.items[0].active).toBe(true)
  })

  it('空の結果を返せる', async () => {
    const db = createMockDb({ selectResult: [] })
    const result = await listProjectMembers(
      { db: db as unknown as DbOrTx },
      createAdminExecutor(),
      { projectId: 'proj-1' },
    )
    expect(result.items).toHaveLength(0)
  })

  it('startedAt と endedAt は ISO 文字列で返される', async () => {
    const db = createMockDb({ selectResult: [activeMemberRow] })
    const result = await listProjectMembers(
      { db: db as unknown as DbOrTx },
      createAdminExecutor(),
      { projectId: 'proj-1' },
    )
    expect(typeof result.items[0].startedAt).toBe('string')
    expect(result.items[0].endedAt).toBeNull()
  })
})
