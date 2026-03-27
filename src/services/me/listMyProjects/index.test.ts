import { describe, it, expect } from 'vitest'
import { ValidationError } from '@/lib/api-server/errors'
import { listMyProjects } from './'
import { createGeneralExecutor, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const projectRow = {
  id: 'proj-1',
  name: 'Test Project',
  description: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('listMyProjects', () => {
  it('自分のプロジェクト一覧を取得できる', async () => {
    const db = createMockDb({ selectResult: [projectRow] })
    const result = await listMyProjects(
      { db: db as unknown as DbOrTx },
      createGeneralExecutor(),
      { limit: 10, offset: 0 },
    )
    expect(result).toHaveProperty('items')
  })

  it('空の結果を返せる', async () => {
    const db = createMockDb({ selectResult: [{ count: 0 }] })
    const result = await listMyProjects(
      { db: db as unknown as DbOrTx },
      createGeneralExecutor(),
      { limit: 10, offset: 0 },
    )
    expect(result).toHaveProperty('items')
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      listMyProjects(
        { db: db as unknown as DbOrTx },
        createGeneralExecutor(),
        { limit: 'bad', offset: 0 } as unknown as { limit: number; offset: number },
      )
    ).rejects.toThrow(ValidationError)
  })
})
