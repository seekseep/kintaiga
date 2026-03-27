import { describe, it, expect } from 'vitest'
import { ForbiddenError } from '@/lib/api-server/errors'
import { updateUser } from './'
import { createAdminUser, createGeneralUser, createMockDb } from '../../testing/helpers'
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
      { type: 'user', user: createAdminUser() },
      { id: 'target-user-id', name: 'Updated' },
    )
    expect(result).toMatchObject({ name: 'Updated' })
  })

  it('一般ユーザーは自分のプロフィールを変更できる', async () => {
    const self = createGeneralUser()
    const updatedSelf = { ...self, name: 'Updated' }
    const db = createMockDb({ updateResult: [updatedSelf] })
    const result = await updateUser(
      { db: db as unknown as DbOrTx },
      { type: 'user', user: self },
      { id: self.id, name: 'Updated' },
    )
    expect(result).toMatchObject({ name: 'Updated' })
  })

  it('一般ユーザーは他人のプロフィールを変更できない', async () => {
    const db = createMockDb()
    await expect(
      updateUser({ db: db as unknown as DbOrTx }, { type: 'user', user: createGeneralUser() }, { id: 'other-user-id', name: 'Hacked' })
    ).rejects.toThrow(ForbiddenError)
  })

  it('一般ユーザーはロールを変更できない', async () => {
    const self = createGeneralUser()
    const db = createMockDb()
    await expect(
      updateUser({ db: db as unknown as DbOrTx }, { type: 'user', user: self }, { id: self.id, role: 'admin' })
    ).rejects.toThrow(ForbiddenError)
  })

  it('管理者はロールを変更できる', async () => {
    const updatedUser = { ...targetUser, role: 'admin' }
    const db = createMockDb({ updateResult: [updatedUser] })
    const result = await updateUser(
      { db: db as unknown as DbOrTx },
      { type: 'user', user: createAdminUser() },
      { id: 'target-user-id', role: 'admin' },
    )
    expect(result).toMatchObject({ role: 'admin' })
  })
})
