import { describe, it, expect } from 'vitest'
import { NotFoundError, ValidationError, ForbiddenError } from '@/lib/api-server/errors'
import { deleteProject } from './'
import { createOwnerExecutor, createMemberExecutor, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const deletedProject = {
  id: 'proj-1',
  name: 'Deleted Project',
  description: null,
  roundingInterval: null,
  roundingDirection: null,
  aggregationUnit: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('deleteProject', () => {
  it('プロジェクトを削除できる', async () => {
    const db = createMockDb({ deleteResult: [deletedProject] })
    const result = await deleteProject(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { id: 'proj-1' },
    )
    expect(result).toMatchObject({ id: 'proj-1' })
  })

  it('一般ユーザーはプロジェクトを削除できない', async () => {
    const db = createMockDb()
    await expect(
      deleteProject(
        { db: db as unknown as DbOrTx },
        createMemberExecutor(),
        { id: 'proj-1' },
      )
    ).rejects.toThrow(ForbiddenError)
  })

  it('存在しないプロジェクトの削除は NotFoundError', async () => {
    const db = createMockDb({ deleteResult: [] })
    await expect(
      deleteProject({ db: db as unknown as DbOrTx }, createOwnerExecutor(), { id: 'nonexistent' })
    ).rejects.toThrow(NotFoundError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      deleteProject({ db: db as unknown as DbOrTx }, createOwnerExecutor(), { id: 123 } as unknown as { id: string })
    ).rejects.toThrow(ValidationError)
  })
})
