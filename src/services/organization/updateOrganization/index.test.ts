import { describe, it, expect } from 'vitest'
import { ForbiddenError, ValidationError, ConflictError, NotFoundError } from '@/lib/api-server/errors'
import { updateOrganization } from './'
import { createMockDb, createOwnerExecutor, createMemberExecutor } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const updatedOrg = { id: 'organization-1', name: 'new-name', displayName: 'New Name', plan: 'free', createdAt: new Date(), updatedAt: new Date() }

describe('updateOrganization', () => {
  it('マネージャー以上が組織を更新できる', async () => {
    const db = createMockDb({ selectResult: [], updateResult: [updatedOrg] })
    const result = await updateOrganization({ db: db as unknown as DbOrTx }, createOwnerExecutor(), { name: 'new-name', displayName: 'New Name' })
    expect(result).toMatchObject({ name: 'new-name' })
  })

  it('一般メンバーは組織を更新できない', async () => {
    const db = createMockDb()
    await expect(
      updateOrganization({ db: db as unknown as DbOrTx }, createMemberExecutor(), { displayName: 'New Name' })
    ).rejects.toThrow(ForbiddenError)
  })

  it('既存の組織名と重複する場合は ConflictError', async () => {
    const db = createMockDb({ selectResult: [{ id: 'other-org' }], updateResult: [updatedOrg] })
    await expect(
      updateOrganization({ db: db as unknown as DbOrTx }, createOwnerExecutor(), { name: 'new-name' })
    ).rejects.toThrow(ConflictError)
  })

  it('組織が見つからない場合は NotFoundError', async () => {
    const db = createMockDb({ selectResult: [], updateResult: [] })
    await expect(
      updateOrganization({ db: db as unknown as DbOrTx }, createOwnerExecutor(), { displayName: 'New Name' })
    ).rejects.toThrow(NotFoundError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      updateOrganization({ db: db as unknown as DbOrTx }, createOwnerExecutor(), { name: 'A' })
    ).rejects.toThrow(ValidationError)
  })
})
