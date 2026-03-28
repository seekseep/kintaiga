import { describe, it, expect } from 'vitest'
import { ValidationError, ForbiddenError } from '@/lib/api-server/errors'
import { createProject } from './'
import { createOwnerExecutor, createMemberExecutor, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const createdProject = {
  id: 'proj-1',
  name: 'New Project',
  description: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('createProject', () => {
  it('プロジェクトを作成できる', async () => {
    const db = createMockDb({ insertResult: [createdProject] })
    const result = await createProject(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { name: 'New Project' },
    )
    expect(result).toMatchObject({ id: 'proj-1', name: 'New Project' })
  })

  it('description を指定してプロジェクトを作成できる', async () => {
    const withDesc = { ...createdProject, description: 'A test project' }
    const db = createMockDb({ insertResult: [withDesc] })
    const result = await createProject(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { name: 'New Project', description: 'A test project' },
    )
    expect(result).toMatchObject({ description: 'A test project' })
  })

  it('description に null を指定できる', async () => {
    const db = createMockDb({ insertResult: [createdProject] })
    const result = await createProject(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { name: 'New Project', description: null },
    )
    expect(result).toMatchObject({ description: null })
  })

  it('一般ユーザーはプロジェクトを作成できない', async () => {
    const db = createMockDb()
    await expect(
      createProject(
        { db: db as unknown as DbOrTx },
        createMemberExecutor(),
        { name: 'New Project' },
      )
    ).rejects.toThrow(ForbiddenError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      createProject(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { name: 123 } as unknown as { name: string },
      )
    ).rejects.toThrow(ValidationError)
  })
})
