import { describe, it, expect } from 'vitest'
import { NotFoundError } from '@/lib/api-server/errors'
import { getOrganizationByName } from './'
import { createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const org = { id: 'org-1', name: 'my-org', displayName: 'My Org', plan: 'free', createdAt: new Date(), updatedAt: new Date() }

describe('getOrganizationByName', () => {
  it('名前で組織を取得できる', async () => {
    const db = createMockDb({ selectResult: [org] })
    const result = await getOrganizationByName({ db: db as unknown as DbOrTx }, 'my-org')
    expect(result).toMatchObject({ id: 'org-1', name: 'my-org' })
  })

  it('組織が見つからない場合は NotFoundError', async () => {
    const db = createMockDb({ selectResult: [] })
    await expect(
      getOrganizationByName({ db: db as unknown as DbOrTx }, 'not-found')
    ).rejects.toThrow(NotFoundError)
  })
})
