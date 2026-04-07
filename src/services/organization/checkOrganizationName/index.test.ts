import { describe, it, expect } from 'vitest'
import { checkOrganizationName } from './'
import { createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

describe('checkOrganizationName', () => {
  it('利用可能な名前は available', async () => {
    const db = createMockDb({ selectResult: [] })
    const result = await checkOrganizationName({ db: db as unknown as DbOrTx }, 'my-org')
    expect(result).toEqual({ available: true, reason: null })
  })

  it('既存の名前は available=false', async () => {
    const db = createMockDb({ selectResult: [{ id: 'org-1' }] })
    const result = await checkOrganizationName({ db: db as unknown as DbOrTx }, 'my-org')
    expect(result.available).toBe(false)
    expect(result.reason).toBe('この名前は既に使用されています')
  })

  it('予約名は available=false', async () => {
    const db = createMockDb({ selectResult: [] })
    const result = await checkOrganizationName({ db: db as unknown as DbOrTx }, 'admin')
    expect(result.available).toBe(false)
    expect(result.reason).toBe('この名前は予約されています')
  })

  it('空文字は available=false', async () => {
    const db = createMockDb()
    const result = await checkOrganizationName({ db: db as unknown as DbOrTx }, '')
    expect(result.available).toBe(false)
    expect(result.reason).toBe('名前を指定してください')
  })
})
