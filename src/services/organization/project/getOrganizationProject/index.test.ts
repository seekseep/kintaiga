import { describe, it, expect } from 'vitest'
import { NotFoundError, ValidationError } from '@/lib/api-server/errors'
import { getOrganizationProject } from '.'
import { createOwnerExecutor, createMemberExecutor, createMockDb } from '../../../testing/helpers'
import type { DbOrTx } from '../../../types'

const existingProject = {
  id: 'proj-1',
  name: 'Test Project',
  description: null,
  roundingInterval: null,
  roundingDirection: null,
  aggregationUnit: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('getOrganizationProject', () => {
  it('プロジェクトが見つかる', async () => {
    const db = createMockDb({ selectResult: [existingProject] })
    const result = await getOrganizationProject({ db: db as unknown as DbOrTx }, createOwnerExecutor(), { id: 'proj-1' })
    expect(result).toMatchObject({ id: 'proj-1', name: 'Test Project' })
  })

  it('一般ユーザーでもプロジェクトを取得できる', async () => {
    const db = createMockDb({ selectResult: [existingProject] })
    const result = await getOrganizationProject({ db: db as unknown as DbOrTx }, createMemberExecutor(), { id: 'proj-1' })
    expect(result).toMatchObject({ id: 'proj-1' })
  })

  it('存在しないプロジェクトは NotFoundError', async () => {
    const db = createMockDb({ selectResult: [] })
    await expect(
      getOrganizationProject({ db: db as unknown as DbOrTx }, createOwnerExecutor(), { id: 'nonexistent' })
    ).rejects.toThrow(NotFoundError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      getOrganizationProject({ db: db as unknown as DbOrTx }, createOwnerExecutor(), { id: 123 } as unknown as { id: string })
    ).rejects.toThrow(ValidationError)
  })
})
