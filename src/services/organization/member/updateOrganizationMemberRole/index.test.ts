import { describe, it, expect } from 'vitest'
import { ForbiddenError, ValidationError, NotFoundError, BadRequestError } from '@/lib/api-server/errors'
import { updateOrganizationMemberRole } from './'
import { createMockDb, createOwnerExecutor, createMemberExecutor } from '../../../testing/helpers'
import type { DbOrTx } from '../../../types'

const workerMember = { id: 'assignment-1', organizationId: 'organization-1', userId: '550e8400-e29b-41d4-a716-446655440000', role: 'worker', createdAt: new Date() }
const ownerMember = { ...workerMember, role: 'owner' }
const updatedMember = { ...workerMember, role: 'manager' }

describe('updateOrganizationMemberRole', () => {
  it('オーナーがメンバーのロールを更新できる', async () => {
    const db = createMockDb({ selectResult: [workerMember], updateResult: [updatedMember] })
    const result = await updateOrganizationMemberRole(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { userId: '550e8400-e29b-41d4-a716-446655440000', role: 'manager' },
    )
    expect(result).toMatchObject({ role: 'manager' })
  })

  it('一般メンバーはロールを更新できない', async () => {
    const db = createMockDb()
    await expect(
      updateOrganizationMemberRole(
        { db: db as unknown as DbOrTx },
        createMemberExecutor(),
        { userId: '550e8400-e29b-41d4-a716-446655440000', role: 'manager' },
      )
    ).rejects.toThrow(ForbiddenError)
  })

  it('メンバーが見つからない場合は NotFoundError', async () => {
    const db = createMockDb({ selectResult: [] })
    await expect(
      updateOrganizationMemberRole(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { userId: '550e8400-e29b-41d4-a716-446655440000', role: 'manager' },
      )
    ).rejects.toThrow(NotFoundError)
  })

  it('オーナーのロールは変更できない', async () => {
    const db = createMockDb({ selectResult: [ownerMember] })
    await expect(
      updateOrganizationMemberRole(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { userId: '550e8400-e29b-41d4-a716-446655440000', role: 'manager' },
      )
    ).rejects.toThrow(BadRequestError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      updateOrganizationMemberRole(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { userId: 'not-uuid', role: 'manager' },
      )
    ).rejects.toThrow(ValidationError)
  })
})
