import { describe, it, expect } from 'vitest'
import { ValidationError, ConflictError } from '@/lib/api-server/errors'
import { createOrganization } from './'
import { createMockDb, createUserExecutor } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const createdOrg = { id: 'org-1', name: 'my-org', displayName: 'My Org', plan: 'free', createdAt: new Date(), updatedAt: new Date() }

describe('createOrganization', () => {
  const executor = createUserExecutor()

  it('組織を作成できる', async () => {
    const db = createMockDb({ selectResult: [], insertResult: [createdOrg] })
    const result = await createOrganization({ db: db as unknown as DbOrTx }, executor, { name: 'my-org', displayName: 'My Org' })
    expect(result).toMatchObject({ id: 'org-1', name: 'my-org' })
  })

  it('既に存在する組織名は ConflictError', async () => {
    const db = createMockDb({ selectResult: [createdOrg] })
    await expect(
      createOrganization({ db: db as unknown as DbOrTx }, executor, { name: 'my-org', displayName: 'My Org' })
    ).rejects.toThrow(ConflictError)
  })

  it('不正な組織名は ValidationError', async () => {
    const db = createMockDb()
    await expect(
      createOrganization({ db: db as unknown as DbOrTx }, executor, { name: 'A', displayName: 'My Org' })
    ).rejects.toThrow(ValidationError)
  })

  it('ハイフンで始まる組織名は ValidationError', async () => {
    const db = createMockDb()
    await expect(
      createOrganization({ db: db as unknown as DbOrTx }, executor, { name: '-invalid', displayName: 'My Org' })
    ).rejects.toThrow(ValidationError)
  })

  it('大文字を含む組織名は ValidationError', async () => {
    const db = createMockDb()
    await expect(
      createOrganization({ db: db as unknown as DbOrTx }, executor, { name: 'MyOrg', displayName: 'My Org' })
    ).rejects.toThrow(ValidationError)
  })
})
