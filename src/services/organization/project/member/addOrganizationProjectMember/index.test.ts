import { describe, it, expect } from 'vitest'
import { ValidationError, ForbiddenError, ConflictError } from '@/lib/errors'
import { addOrganizationProjectMember } from '.'
import { createOwnerExecutor, createMemberExecutor, createMockDb } from '../../../../testing/helpers'
import type { DbOrTx } from '../../../../types'

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

describe('addOrganizationProjectMember', () => {
  it('アサインメントを作成できる', async () => {
    const db = createMockDb({ selectResults: [[]], insertResult: [createdAssignment] })
    const result = await addOrganizationProjectMember(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { projectId: 'proj-1', userId: 'user-1', startedAt: '2024-01-01T00:00:00' },
    )
    expect(result).toMatchObject({ id: 'asgn-1', projectId: 'proj-1', userId: 'user-1' })
  })

  it('targetMinutes を指定してアサインメントを作成できる', async () => {
    const withTarget = { ...createdAssignment, targetMinutes: 120 }
    const db = createMockDb({ selectResults: [[]], insertResult: [withTarget] })
    const result = await addOrganizationProjectMember(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { projectId: 'proj-1', userId: 'user-1', startedAt: '2024-01-01T00:00:00', targetMinutes: 120 },
    )
    expect(result).toMatchObject({ targetMinutes: 120 })
  })

  it('期間が離れた既存アサインメントとは衝突しない', async () => {
    const existing = {
      ...createdAssignment,
      startedAt: new Date('2023-01-01'),
      endedAt: new Date('2023-12-31'),
    }
    const db = createMockDb({ selectResults: [[existing]], insertResult: [createdAssignment] })
    const result = await addOrganizationProjectMember(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { projectId: 'proj-1', userId: 'user-1', startedAt: '2024-01-01T00:00:00' },
    )
    expect(result).toMatchObject({ id: 'asgn-1' })
  })

  it('既存アサインメントと期間が重複する場合は ConflictError', async () => {
    const existing = {
      ...createdAssignment,
      startedAt: new Date('2024-05-01'),
      endedAt: new Date('2024-05-31'),
    }
    const db = createMockDb({ selectResults: [[existing]] })
    await expect(
      addOrganizationProjectMember(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        {
          projectId: 'proj-1',
          userId: 'user-1',
          startedAt: '2024-05-01T00:00:00',
          endedAt: '2024-05-31T00:00:00',
        },
      ),
    ).rejects.toThrow(ConflictError)
  })

  it('既存が endedAt=null (永続) なら以降の期間と重複扱い', async () => {
    const existing = {
      ...createdAssignment,
      startedAt: new Date('2024-01-01'),
      endedAt: null,
    }
    const db = createMockDb({ selectResults: [[existing]] })
    await expect(
      addOrganizationProjectMember(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        {
          projectId: 'proj-1',
          userId: 'user-1',
          startedAt: '2025-06-01T00:00:00',
          endedAt: '2025-06-30T00:00:00',
        },
      ),
    ).rejects.toThrow(ConflictError)
  })

  it('一般ユーザーはアサインメントを作成できない', async () => {
    const db = createMockDb()
    await expect(
      addOrganizationProjectMember(
        { db: db as unknown as DbOrTx },
        createMemberExecutor(),
        { projectId: 'proj-1', userId: 'user-1', startedAt: '2024-01-01T00:00:00' },
      )
    ).rejects.toThrow(ForbiddenError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      addOrganizationProjectMember(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { projectId: 123 } as unknown as { projectId: string; userId: string; startedAt: string },
      )
    ).rejects.toThrow(ValidationError)
  })

  it('targetMinutes が負の値は ValidationError', async () => {
    const db = createMockDb()
    await expect(
      addOrganizationProjectMember(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { projectId: 'proj-1', userId: 'user-1', startedAt: '2024-01-01T00:00:00', targetMinutes: -1 },
      )
    ).rejects.toThrow(ValidationError)
  })
})
