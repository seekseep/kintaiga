import { describe, it, expect, vi } from 'vitest'
import { ForbiddenError, ValidationError, ConflictError, NotFoundError, BadRequestError } from '@/lib/api-server/errors'
import { addOrganizationMember } from './'
import { createMockDb, createOwnerExecutor, createMemberExecutor } from '../../../testing/helpers'
import type { DbOrTx } from '../../../types'

const user = { id: 'found-user-id', name: 'Found User', email: 'found@example.com', role: 'general', iconUrl: null, createdAt: new Date(), updatedAt: new Date() }
const createdAssignment = { id: 'assignment-1', organizationId: 'organization-1', userId: 'found-user-id', role: 'worker', createdAt: new Date() }

describe('addOrganizationMember', () => {
  it('オーナーがメンバーを追加できる', async () => {
    // select: 1st=user lookup, 2nd=existing check, 3rd=current members count
    const selectFn = vi.fn()
      .mockResolvedValueOnce([user])        // user lookup
      .mockResolvedValueOnce([])             // existing check
      .mockResolvedValueOnce([{ id: '1' }]) // current members (1 member, under limit)
    const chain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([createdAssignment]),
    }
    const selectChain = Object.assign(Promise.resolve([]), {
      from: vi.fn().mockReturnValue(Object.assign(Promise.resolve([]), {
        where: vi.fn().mockImplementation(() => {
          const currentCall = selectFn.mock.calls.length
          selectFn()
          const result = currentCall === 0 ? [user] : currentCall === 1 ? [] : [{ id: '1' }]
          return Object.assign(Promise.resolve(result), {
            limit: vi.fn().mockReturnValue(Promise.resolve(result)),
          })
        }),
      })),
    })
    const db = {
      select: vi.fn(() => selectChain),
      insert: vi.fn(() => Object.assign(Promise.resolve([createdAssignment]), chain)),
    }
    const result = await addOrganizationMember(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { email: 'found@example.com' },
    )
    expect(result).toMatchObject({ userId: 'found-user-id', role: 'worker' })
  })

  it('一般メンバーはメンバーを追加できない', async () => {
    const db = createMockDb()
    await expect(
      addOrganizationMember(
        { db: db as unknown as DbOrTx },
        createMemberExecutor(),
        { email: 'test@example.com' },
      )
    ).rejects.toThrow(ForbiddenError)
  })

  it('不正なメールアドレスは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      addOrganizationMember(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { email: 'not-email' },
      )
    ).rejects.toThrow(ValidationError)
  })

  it('ユーザーが見つからない場合は NotFoundError', async () => {
    const db = createMockDb({ selectResult: [] })
    await expect(
      addOrganizationMember(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { email: 'notfound@example.com' },
      )
    ).rejects.toThrow(NotFoundError)
  })
})
