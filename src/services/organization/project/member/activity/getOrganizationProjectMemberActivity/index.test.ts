import { describe, it, expect } from 'vitest'
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/api-server/errors'
import { getOrganizationProjectMemberActivity } from '.'
import { createOwnerExecutor, createMemberExecutor, createMockDb } from '../../../../../testing/helpers'
import type { DbOrTx } from '../../../../../types'

const activityOwnedByOther = {
  id: 'act-1',
  userId: 'other-user-id',
  projectId: 'proj-1',
  startedAt: new Date('2024-06-01T09:00:00Z'),
  endedAt: null,
  note: null,
  createdAt: new Date('2024-06-01T09:00:00Z'),
  updatedAt: new Date('2024-06-01T09:00:00Z'),
  projectName: 'Test Project',
}

const activityOwnedBySelf = {
  ...activityOwnedByOther,
  userId: 'member-user-id',
}

describe('getOrganizationProjectMemberActivity', () => {
  it('管理者は他人のアクティビティを取得できる', async () => {
    const db = createMockDb({ selectResult: [activityOwnedByOther] })
    const result = await getOrganizationProjectMemberActivity({ db: db as unknown as DbOrTx }, createOwnerExecutor(), { id: 'act-1' })
    expect(result).toMatchObject({ id: 'act-1' })
  })

  it('一般ユーザーは自分のアクティビティを取得できる', async () => {
    const db = createMockDb({ selectResult: [activityOwnedBySelf] })
    const result = await getOrganizationProjectMemberActivity({ db: db as unknown as DbOrTx }, createMemberExecutor(), { id: 'act-1' })
    expect(result).toMatchObject({ id: 'act-1' })
  })

  it('一般ユーザーは他人のアクティビティを取得できない', async () => {
    const db = createMockDb({ selectResult: [activityOwnedByOther] })
    await expect(
      getOrganizationProjectMemberActivity({ db: db as unknown as DbOrTx }, createMemberExecutor(), { id: 'act-1' })
    ).rejects.toThrow(ForbiddenError)
  })

  it('存在しないアクティビティは NotFoundError', async () => {
    const db = createMockDb({ selectResult: [] })
    await expect(
      getOrganizationProjectMemberActivity({ db: db as unknown as DbOrTx }, createOwnerExecutor(), { id: 'nonexistent' })
    ).rejects.toThrow(NotFoundError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      getOrganizationProjectMemberActivity({ db: db as unknown as DbOrTx }, createOwnerExecutor(), { id: 123 } as unknown as { id: string })
    ).rejects.toThrow(ValidationError)
  })
})
