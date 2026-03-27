import { describe, it, expect } from 'vitest'
import { ValidationError } from '@/lib/api-server/errors'
import { updateProfile } from './'
import { createGeneralExecutor, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const updatedUser = {
  id: 'general-user-id',
  name: 'Updated Name',
  role: 'general',
  iconUrl: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-06-01'),
}

describe('updateProfile', () => {
  it('名前を更新できる', async () => {
    const db = createMockDb({ updateResult: [updatedUser] })
    const result = await updateProfile(
      { db: db as unknown as DbOrTx },
      createGeneralExecutor(),
      { name: 'Updated Name' },
    )
    expect(result).toMatchObject({ id: 'general-user-id', name: 'Updated Name' })
  })

  it('name を省略しても更新できる（updatedAt のみ更新）', async () => {
    const db = createMockDb({ updateResult: [{ ...updatedUser, name: 'General' }] })
    const result = await updateProfile(
      { db: db as unknown as DbOrTx },
      createGeneralExecutor(),
      {},
    )
    expect(result).toMatchObject({ id: 'general-user-id' })
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      updateProfile(
        { db: db as unknown as DbOrTx },
        createGeneralExecutor(),
        { name: 123 } as unknown as { name?: string },
      )
    ).rejects.toThrow(ValidationError)
  })
})
