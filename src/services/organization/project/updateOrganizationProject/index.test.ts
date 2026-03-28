import { describe, it, expect } from 'vitest'
import { NotFoundError, ValidationError, ForbiddenError } from '@/lib/api-server/errors'
import { updateOrganizationProject } from '.'
import { createOwnerExecutor, createMemberExecutor, createMockDb } from '../../../testing/helpers'
import type { DbOrTx } from '../../../types'

const existingProject = {
  id: 'proj-1',
  name: 'Test Project',
  description: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('updateOrganizationProject', () => {
  it('name を更新できる', async () => {
    const updated = { ...existingProject, name: 'Updated' }
    const db = createMockDb({ updateResult: [updated] })
    const result = await updateOrganizationProject(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { id: 'proj-1', name: 'Updated' },
    )
    expect(result).toMatchObject({ name: 'Updated' })
  })

  it('description を更新できる', async () => {
    const updated = { ...existingProject, description: 'New description' }
    const db = createMockDb({ updateResult: [updated] })
    const result = await updateOrganizationProject(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { id: 'proj-1', description: 'New description' },
    )
    expect(result).toMatchObject({ description: 'New description' })
  })

  it('description を null にリセットできる', async () => {
    const updated = { ...existingProject, description: null }
    const db = createMockDb({ updateResult: [updated] })
    const result = await updateOrganizationProject(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { id: 'proj-1', description: null },
    )
    expect(result).toMatchObject({ description: null })
  })

  it('一般ユーザーはプロジェクトを更新できない', async () => {
    const db = createMockDb()
    await expect(
      updateOrganizationProject(
        { db: db as unknown as DbOrTx },
        createMemberExecutor(),
        { id: 'proj-1', name: 'Updated' },
      )
    ).rejects.toThrow(ForbiddenError)
  })

  it('存在しないプロジェクトの更新は NotFoundError', async () => {
    const db = createMockDb({ updateResult: [] })
    await expect(
      updateOrganizationProject({ db: db as unknown as DbOrTx }, createOwnerExecutor(), { id: 'nonexistent', name: 'Updated' })
    ).rejects.toThrow(NotFoundError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      updateOrganizationProject({ db: db as unknown as DbOrTx }, createOwnerExecutor(), { id: 123 } as unknown as { id: string })
    ).rejects.toThrow(ValidationError)
  })
})
