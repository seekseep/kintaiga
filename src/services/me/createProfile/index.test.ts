import { describe, it, expect } from 'vitest'
import { ConflictError } from '@/lib/api-server/errors'
import { createProfile } from './'
import { createGeneralUser, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

describe('createProfile', () => {
  it('未登録ユーザーがプロフィールを作成できる', async () => {
    const newUser = { id: 'sub-id', name: 'New User', role: 'general' as const, iconUrl: null, createdAt: new Date(), updatedAt: new Date() }
    const db = createMockDb({ insertResult: [newUser] })
    const result = await createProfile({ db: db as unknown as DbOrTx }, null, { sub: 'sub-id', name: 'New User' })
    expect(result).toMatchObject({ id: 'sub-id', name: 'New User' })
  })

  it('既に登録済みの場合は ConflictError', async () => {
    const db = createMockDb()
    await expect(
      createProfile({ db: db as unknown as DbOrTx }, { type: 'user', user: createGeneralUser() }, { sub: 'sub-id', name: 'Duplicate' })
    ).rejects.toThrow(ConflictError)
  })
})
