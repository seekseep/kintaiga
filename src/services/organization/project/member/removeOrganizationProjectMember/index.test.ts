import { describe, it, expect } from 'vitest'
import { NotFoundError, ValidationError, ForbiddenError } from '@/lib/api-server/errors'
import { removeOrganizationProjectMember } from '.'
import { createOwnerExecutor, createMemberExecutor, createMockDb } from '../../../../testing/helpers'
import type { DbOrTx } from '../../../../types'

const deletedAssignment = {
  id: 'asgn-1',
  projectId: 'proj-1',
  userId: 'user-1',
  startedAt: new Date('2024-01-01'),
  endedAt: null,
  targetMinutes: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('removeOrganizationProjectMember', () => {
  it('アサインメントを削除できる', async () => {
    const db = createMockDb({ deleteResult: [deletedAssignment] })
    const result = await removeOrganizationProjectMember(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { id: 'asgn-1' },
    )
    expect(result).toMatchObject({ id: 'asgn-1' })
  })

  it('一般ユーザーはアサインメントを削除できない', async () => {
    const db = createMockDb()
    await expect(
      removeOrganizationProjectMember({ db: db as unknown as DbOrTx }, createMemberExecutor(), { id: 'asgn-1' })
    ).rejects.toThrow(ForbiddenError)
  })

  it('存在しないアサインメントの削除は NotFoundError', async () => {
    const db = createMockDb({ deleteResult: [] })
    await expect(
      removeOrganizationProjectMember({ db: db as unknown as DbOrTx }, createOwnerExecutor(), { id: 'nonexistent' })
    ).rejects.toThrow(NotFoundError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      removeOrganizationProjectMember({ db: db as unknown as DbOrTx }, createOwnerExecutor(), { id: 123 } as unknown as { id: string })
    ).rejects.toThrow(ValidationError)
  })
})
