import { describe, it, expect } from 'vitest'
import { ForbiddenError, NotFoundError } from '@/lib/api-server/errors'
import { deleteOrganization } from './'
import { createMockDb, createOwnerExecutor, createMemberExecutor } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const deletedOrg = { id: 'organization-1', name: 'my-org', displayName: 'My Org', plan: 'free', createdAt: new Date(), updatedAt: new Date() }

describe('deleteOrganization', () => {
  it('マネージャー以上が組織を削除できる', async () => {
    const db = createMockDb({ deleteResult: [deletedOrg] })
    const result = await deleteOrganization({ db: db as unknown as DbOrTx }, createOwnerExecutor())
    expect(result).toMatchObject({ id: 'organization-1' })
  })

  it('一般メンバーは組織を削除できない', async () => {
    const db = createMockDb()
    await expect(
      deleteOrganization({ db: db as unknown as DbOrTx }, createMemberExecutor())
    ).rejects.toThrow(ForbiddenError)
  })

  it('組織が見つからない場合は NotFoundError', async () => {
    const db = createMockDb({ deleteResult: [] })
    await expect(
      deleteOrganization({ db: db as unknown as DbOrTx }, createOwnerExecutor())
    ).rejects.toThrow(NotFoundError)
  })
})
