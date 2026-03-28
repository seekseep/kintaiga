import { describe, it, expect } from 'vitest'
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/api-server/errors'
import { updateUser } from '.'
import { createAdminExecutor, createGeneralExecutor, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const targetUser = {
  id: 'target-user-id',
  name: 'Target',
  role: 'general' as const,
  iconUrl: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('updateUser', () => {
  it('管理者は他人のプロフィールを変更できる', async () => {
    const updatedUser = { ...targetUser, name: 'Updated' }
    const db = createMockDb({ updateResult: [updatedUser] })
    const result = await updateUser(
      { db: db as unknown as DbOrTx },
      createAdminExecutor(),
      { id: 'target-user-id', name: 'Updated' },
    )
    expect(result).toMatchObject({ name: 'Updated' })
  })

  it('一般ユーザーは自分のプロフィールを変更できる', async () => {
    const self = createGeneralExecutor()
    const updatedSelf = { ...self, name: 'Updated' }
    const db = createMockDb({ updateResult: [updatedSelf] })
    const result = await updateUser(
      { db: db as unknown as DbOrTx },
      self,
      { id: self.user.id, name: 'Updated' },
    )
    expect(result).toMatchObject({ name: 'Updated' })
  })

  it('一般ユーザーは他人のプロフィールを変更できない', async () => {
    const db = createMockDb()
    await expect(
      updateUser({ db: db as unknown as DbOrTx }, createGeneralExecutor(), { id: 'other-user-id', name: 'Hacked' })
    ).rejects.toThrow(ForbiddenError)
  })

  it('存在しないユーザーの更新は NotFoundError', async () => {
    const db = createMockDb({ updateResult: [] })
    await expect(
      updateUser({ db: db as unknown as DbOrTx }, createAdminExecutor(), { id: 'nonexistent', name: 'Updated' })
    ).rejects.toThrow(NotFoundError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      updateUser({ db: db as unknown as DbOrTx }, createAdminExecutor(), { id: 123 } as unknown as { id: string })
    ).rejects.toThrow(ValidationError)
  })
})
