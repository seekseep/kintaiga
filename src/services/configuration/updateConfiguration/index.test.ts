import { describe, it, expect } from 'vitest'
import { NotFoundError } from '@/lib/api-server/errors'
import { updateConfiguration } from './'
import { createAdminUser, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

describe('updateConfiguration', () => {
  it('設定が存在しない場合は NotFoundError', async () => {
    const db = createMockDb({ selectResult: [] })
    await expect(
      updateConfiguration({ db: db as unknown as DbOrTx }, { type: 'user', user: createAdminUser() }, { roundingInterval: 30 })
    ).rejects.toThrow(NotFoundError)
  })
})
