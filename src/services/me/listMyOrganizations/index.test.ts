import { describe, it, expect } from 'vitest'
import { listMyOrganizations } from './'
import { createMockDb, createUserExecutor } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const orgRow = {
  id: 'org-1',
  name: 'my-org',
  displayName: 'My Org',
  plan: 'free',
  organizationRole: 'owner',
  createdAt: new Date('2024-01-01'),
}

describe('listMyOrganizations', () => {
  it('所属組織一覧を取得できる', async () => {
    const db = createMockDb({ selectResult: [orgRow] })
    const result = await listMyOrganizations({ db: db as unknown as DbOrTx }, createUserExecutor())
    expect(result.items).toHaveLength(1)
    expect(result.items[0]).toMatchObject({ id: 'org-1', organizationRole: 'owner' })
  })

  it('所属組織が無い場合は空配列', async () => {
    const db = createMockDb({ selectResult: [] })
    const result = await listMyOrganizations({ db: db as unknown as DbOrTx }, createUserExecutor())
    expect(result.items).toEqual([])
  })
})
