import { describe, it, expect } from 'vitest'
import { NotFoundError } from '@/lib/api-server/errors'
import { getProfile } from './'
import { createUserExecutor, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

describe('getProfile', () => {
  it('ユーザーが存在する場合はそのまま返す', async () => {
    const executor = createUserExecutor()
    const userRow = { id: executor.user.id, name: 'General', role: 'general', iconUrl: null, createdAt: new Date(), updatedAt: new Date() }
    const db = createMockDb({ selectResult: [userRow] })
    const result = await getProfile({ db: db as unknown as DbOrTx }, executor)
    expect(result).toMatchObject({ id: executor.user.id })
  })

  it('executor が null の場合は NotFoundError', async () => {
    const db = createMockDb()
    await expect(getProfile({ db: db as unknown as DbOrTx }, null)).rejects.toThrow(NotFoundError)
  })
})
