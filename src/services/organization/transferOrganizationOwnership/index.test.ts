import { describe, it, expect } from 'vitest'
import { ForbiddenError, ValidationError, NotFoundError } from '@/lib/api-server/errors'
import { transferOrganizationOwnership } from './'
import { createMockDb, createOwnerExecutor, createMemberExecutor } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const memberAssignment = { id: 'assignment-1', organizationId: 'organization-1', userId: '550e8400-e29b-41d4-a716-446655440000', role: 'worker' }
const updatedAssignment = { ...memberAssignment, role: 'owner' }

describe('transferOrganizationOwnership', () => {
  it('オーナーが所有権を移譲できる', async () => {
    const db = createMockDb({ selectResult: [memberAssignment], updateResult: [updatedAssignment] })
    const result = await transferOrganizationOwnership(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { newOwnerUserId: '550e8400-e29b-41d4-a716-446655440000' },
    )
    expect(result).toMatchObject({ role: 'owner' })
  })

  it('一般メンバーは所有権を移譲できない', async () => {
    const db = createMockDb()
    await expect(
      transferOrganizationOwnership(
        { db: db as unknown as DbOrTx },
        createMemberExecutor(),
        { newOwnerUserId: '550e8400-e29b-41d4-a716-446655440000' },
      )
    ).rejects.toThrow(ForbiddenError)
  })

  it('メンバーでないユーザーへの移譲は NotFoundError', async () => {
    const db = createMockDb({ selectResult: [] })
    await expect(
      transferOrganizationOwnership(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { newOwnerUserId: '550e8400-e29b-41d4-a716-446655440000' },
      )
    ).rejects.toThrow(NotFoundError)
  })

  it('不正な UUID は ValidationError', async () => {
    const db = createMockDb()
    await expect(
      transferOrganizationOwnership(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { newOwnerUserId: 'not-a-uuid' },
      )
    ).rejects.toThrow(ValidationError)
  })
})
