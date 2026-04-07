import { describe, it, expect } from 'vitest'
import { NotFoundError } from '@/lib/api-server/errors'
import { getOrganizationProjectByName } from './'
import { createMockDb, createOwnerExecutor } from '../../../testing/helpers'
import type { DbOrTx } from '../../../types'

const projectRow = { id: 'proj-1', organizationId: 'organization-1', name: 'my-project' }

describe('getOrganizationProjectByName', () => {
  it('プロジェクトを取得できる', async () => {
    const db = createMockDb({ selectResult: [projectRow] })
    const result = await getOrganizationProjectByName(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      'my-project',
    )
    expect(result).toMatchObject({ id: 'proj-1', name: 'my-project' })
  })

  it('存在しない場合は NotFoundError', async () => {
    const db = createMockDb({ selectResult: [] })
    await expect(
      getOrganizationProjectByName(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        'missing',
      ),
    ).rejects.toThrow(NotFoundError)
  })
})
