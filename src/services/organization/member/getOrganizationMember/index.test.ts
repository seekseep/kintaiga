import { describe, it, expect } from 'vitest'
import { ValidationError, NotFoundError } from '@/lib/api-server/errors'
import { getOrganizationMember } from './'
import { createMockDb, createOwnerExecutor } from '../../../testing/helpers'
import type { DbOrTx } from '../../../types'

const memberRow = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'user@example.com',
  name: 'User',
  role: 'general',
  organizationRole: 'worker',
  iconUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('getOrganizationMember', () => {
  it('メンバーを取得できる', async () => {
    const db = createMockDb({ selectResult: [memberRow] })
    const result = await getOrganizationMember(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { memberId: '11111111-1111-4111-8111-111111111111' },
    )
    expect(result).toMatchObject({ id: '11111111-1111-4111-8111-111111111111', email: 'user@example.com' })
  })

  it('存在しない場合は NotFoundError', async () => {
    const db = createMockDb({ selectResult: [] })
    await expect(
      getOrganizationMember(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { memberId: '11111111-1111-4111-8111-111111111111' },
      ),
    ).rejects.toThrow(NotFoundError)
  })

  it('memberId が UUID でない場合は ValidationError', async () => {
    const db = createMockDb()
    await expect(
      getOrganizationMember(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { memberId: 'invalid' },
      ),
    ).rejects.toThrow(ValidationError)
  })
})
