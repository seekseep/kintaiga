import { describe, it, expect } from 'vitest'
import { NotFoundError, ValidationError, ForbiddenError, ConflictError } from '@/lib/errors'
import { updateOrganizationProjectMember } from '.'
import { createOwnerExecutor, createMemberExecutor, createMockDb } from '../../../../testing/helpers'
import type { DbOrTx } from '../../../../types'

const existingAssignment = {
  id: 'asgn-1',
  projectId: 'proj-1',
  userId: 'user-1',
  startedAt: new Date('2024-01-01'),
  endedAt: null,
  targetMinutes: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('updateOrganizationProjectMember', () => {
  it('endedAt を更新できる', async () => {
    const updated = { ...existingAssignment, endedAt: new Date('2024-12-31') }
    const db = createMockDb({
      selectResults: [[existingAssignment], []],
      updateResult: [updated],
    })
    const result = await updateOrganizationProjectMember(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { id: 'asgn-1', endedAt: '2024-12-31' },
    )
    expect(result).toMatchObject({ id: 'asgn-1', endedAt: new Date('2024-12-31') })
  })

  it('endedAt を null にリセットできる', async () => {
    const updated = { ...existingAssignment, endedAt: null }
    const db = createMockDb({
      selectResults: [[existingAssignment], []],
      updateResult: [updated],
    })
    const result = await updateOrganizationProjectMember(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { id: 'asgn-1', endedAt: null },
    )
    expect(result).toMatchObject({ endedAt: null })
  })

  it('startedAt を更新できる', async () => {
    const updated = { ...existingAssignment, startedAt: new Date('2024-06-01') }
    const db = createMockDb({
      selectResults: [[existingAssignment], []],
      updateResult: [updated],
    })
    const result = await updateOrganizationProjectMember(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { id: 'asgn-1', startedAt: '2024-06-01' },
    )
    expect(result).toMatchObject({ startedAt: new Date('2024-06-01') })
  })

  it('targetMinutes を更新できる', async () => {
    const updated = { ...existingAssignment, targetMinutes: 120 }
    const db = createMockDb({
      selectResults: [[existingAssignment]],
      updateResult: [updated],
    })
    const result = await updateOrganizationProjectMember(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { id: 'asgn-1', targetMinutes: 120 },
    )
    expect(result).toMatchObject({ targetMinutes: 120 })
  })

  it('targetMinutes を null にリセットできる', async () => {
    const updated = { ...existingAssignment, targetMinutes: null }
    const db = createMockDb({
      selectResults: [[existingAssignment]],
      updateResult: [updated],
    })
    const result = await updateOrganizationProjectMember(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { id: 'asgn-1', targetMinutes: null },
    )
    expect(result).toMatchObject({ targetMinutes: null })
  })

  it('期間変更で他の assignment と重複する場合は ConflictError', async () => {
    const sibling = {
      ...existingAssignment,
      id: 'asgn-2',
      startedAt: new Date('2025-01-01'),
      endedAt: new Date('2025-01-31'),
    }
    const db = createMockDb({
      selectResults: [[existingAssignment], [sibling]],
    })
    await expect(
      updateOrganizationProjectMember(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { id: 'asgn-1', startedAt: '2025-01-15', endedAt: '2025-02-15' },
      ),
    ).rejects.toThrow(ConflictError)
  })

  it('期間変更でも重複しなければ更新できる', async () => {
    const sibling = {
      ...existingAssignment,
      id: 'asgn-2',
      startedAt: new Date('2023-01-01'),
      endedAt: new Date('2023-12-31'),
    }
    const updated = { ...existingAssignment, startedAt: new Date('2024-06-01') }
    const db = createMockDb({
      selectResults: [[existingAssignment], [sibling]],
      updateResult: [updated],
    })
    const result = await updateOrganizationProjectMember(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { id: 'asgn-1', startedAt: '2024-06-01' },
    )
    expect(result).toMatchObject({ startedAt: new Date('2024-06-01') })
  })

  it('一般ユーザーはアサインメントを更新できない', async () => {
    const db = createMockDb()
    await expect(
      updateOrganizationProjectMember({ db: db as unknown as DbOrTx }, createMemberExecutor(), { id: 'asgn-1', endedAt: '2024-12-31' })
    ).rejects.toThrow(ForbiddenError)
  })

  it('存在しないアサインメントの更新は NotFoundError', async () => {
    const db = createMockDb({ selectResults: [[]] })
    await expect(
      updateOrganizationProjectMember({ db: db as unknown as DbOrTx }, createOwnerExecutor(), { id: 'nonexistent', endedAt: '2024-12-31' })
    ).rejects.toThrow(NotFoundError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      updateOrganizationProjectMember({ db: db as unknown as DbOrTx }, createOwnerExecutor(), { id: 123 } as unknown as { id: string })
    ).rejects.toThrow(ValidationError)
  })

  it('targetMinutes が負の値は ValidationError', async () => {
    const db = createMockDb()
    await expect(
      updateOrganizationProjectMember({ db: db as unknown as DbOrTx }, createOwnerExecutor(), { id: 'asgn-1', targetMinutes: -1 })
    ).rejects.toThrow(ValidationError)
  })
})
