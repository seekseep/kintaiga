import { describe, it, expect } from 'vitest'
import { NotFoundError, ValidationError } from '@/lib/api-server/errors'
import { getOrganizationProjectMember } from '.'
import { createOwnerExecutor, createMemberExecutor, createMockDb } from '../../../../testing/helpers'
import type { DbOrTx } from '../../../../types'

const existingAssignment = {
  id: 'assign-1',
  projectId: 'proj-1',
  userId: 'user-1',
  startedAt: new Date('2024-01-01'),
  endedAt: null,
  createdAt: new Date('2024-01-01'),
}

describe('getOrganizationProjectMember', () => {
  it('アサインメントが見つかる', async () => {
    const db = createMockDb({ selectResult: [existingAssignment] })
    const result = await getOrganizationProjectMember({ db: db as unknown as DbOrTx }, createOwnerExecutor(), { id: 'assign-1' })
    expect(result).toMatchObject({ id: 'assign-1' })
  })

  it('一般ユーザーでもアサインメントを取得できる', async () => {
    const db = createMockDb({ selectResult: [existingAssignment] })
    const result = await getOrganizationProjectMember({ db: db as unknown as DbOrTx }, createMemberExecutor(), { id: 'assign-1' })
    expect(result).toMatchObject({ id: 'assign-1' })
  })

  it('存在しないアサインメントは NotFoundError', async () => {
    const db = createMockDb({ selectResult: [] })
    await expect(
      getOrganizationProjectMember({ db: db as unknown as DbOrTx }, createOwnerExecutor(), { id: 'nonexistent' })
    ).rejects.toThrow(NotFoundError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      getOrganizationProjectMember({ db: db as unknown as DbOrTx }, createOwnerExecutor(), { id: 123 } as unknown as { id: string })
    ).rejects.toThrow(ValidationError)
  })
})
