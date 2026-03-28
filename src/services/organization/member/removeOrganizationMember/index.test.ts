import { describe, it, expect } from 'vitest'
import { ForbiddenError, ValidationError, NotFoundError, BadRequestError } from '@/lib/api-server/errors'
import { removeOrganizationMember } from './'
import { createMockDb, createOwnerExecutor, createMemberExecutor } from '../../../testing/helpers'
import type { DbOrTx } from '../../../types'

const workerMember = { id: 'assignment-1', organizationId: 'organization-1', userId: '550e8400-e29b-41d4-a716-446655440000', role: 'worker', createdAt: new Date() }
const ownerMember = { ...workerMember, role: 'owner' }

describe('removeOrganizationMember', () => {
  it('オーナーがメンバーを削除できる', async () => {
    const db = createMockDb({ selectResult: [workerMember], deleteResult: [workerMember] })
    const result = await removeOrganizationMember(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { userId: '550e8400-e29b-41d4-a716-446655440000' },
    )
    expect(result).toMatchObject({ id: 'assignment-1' })
  })

  it('一般メンバーはメンバーを削除できない', async () => {
    const db = createMockDb()
    await expect(
      removeOrganizationMember(
        { db: db as unknown as DbOrTx },
        createMemberExecutor(),
        { userId: '550e8400-e29b-41d4-a716-446655440000' },
      )
    ).rejects.toThrow(ForbiddenError)
  })

  it('メンバーが見つからない場合は NotFoundError', async () => {
    const db = createMockDb({ selectResult: [] })
    await expect(
      removeOrganizationMember(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { userId: '550e8400-e29b-41d4-a716-446655440000' },
      )
    ).rejects.toThrow(NotFoundError)
  })

  it('オーナーは削除できない', async () => {
    const db = createMockDb({ selectResult: [ownerMember] })
    await expect(
      removeOrganizationMember(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { userId: '550e8400-e29b-41d4-a716-446655440000' },
      )
    ).rejects.toThrow(BadRequestError)
  })

  it('不正な UUID は ValidationError', async () => {
    const db = createMockDb()
    await expect(
      removeOrganizationMember(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { userId: 'not-uuid' },
      )
    ).rejects.toThrow(ValidationError)
  })
})
