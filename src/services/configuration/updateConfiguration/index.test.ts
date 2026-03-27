import { describe, it, expect } from 'vitest'
import { NotFoundError, ValidationError, ForbiddenError } from '@/lib/api-server/errors'
import { updateConfiguration } from './'
import { createAdminExecutor, createGeneralExecutor, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const existingConfig = {
  id: 'config-1',
  roundingInterval: 15,
  roundingDirection: 'ceil' as const,
  aggregationUnit: 'monthly' as const,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

describe('updateConfiguration', () => {
  it('roundingInterval を更新できる', async () => {
    const updated = { ...existingConfig, roundingInterval: 30 }
    const db = createMockDb({ selectResult: [existingConfig], updateResult: [updated] })
    const result = await updateConfiguration(
      { db: db as unknown as DbOrTx },
      createAdminExecutor(),
      { roundingInterval: 30 },
    )
    expect(result).toMatchObject({ roundingInterval: 30 })
  })

  it('roundingDirection を更新できる', async () => {
    const updated = { ...existingConfig, roundingDirection: 'floor' as const }
    const db = createMockDb({ selectResult: [existingConfig], updateResult: [updated] })
    const result = await updateConfiguration(
      { db: db as unknown as DbOrTx },
      createAdminExecutor(),
      { roundingDirection: 'floor' },
    )
    expect(result).toMatchObject({ roundingDirection: 'floor' })
  })

  it('aggregationUnit を更新できる', async () => {
    const updated = { ...existingConfig, aggregationUnit: 'none' as const }
    const db = createMockDb({ selectResult: [existingConfig], updateResult: [updated] })
    const result = await updateConfiguration(
      { db: db as unknown as DbOrTx },
      createAdminExecutor(),
      { aggregationUnit: 'none' },
    )
    expect(result).toMatchObject({ aggregationUnit: 'none' })
  })

  it('一般ユーザーは設定を更新できない', async () => {
    const db = createMockDb()
    await expect(
      updateConfiguration(
        { db: db as unknown as DbOrTx },
        createGeneralExecutor(),
        { roundingInterval: 30 },
      )
    ).rejects.toThrow(ForbiddenError)
  })

  it('設定が存在しない場合は NotFoundError', async () => {
    const db = createMockDb({ selectResult: [] })
    await expect(
      updateConfiguration({ db: db as unknown as DbOrTx }, createAdminExecutor(), { roundingInterval: 30 })
    ).rejects.toThrow(NotFoundError)
  })

  it('不正な roundingInterval は ValidationError', async () => {
    const db = createMockDb()
    await expect(
      updateConfiguration({ db: db as unknown as DbOrTx }, createAdminExecutor(), { roundingInterval: 7 })
    ).rejects.toThrow(ValidationError)
  })

  it('不正な roundingDirection は ValidationError', async () => {
    const db = createMockDb()
    await expect(
      updateConfiguration({ db: db as unknown as DbOrTx }, createAdminExecutor(), { roundingDirection: 'invalid' } as unknown as { roundingDirection: 'ceil' | 'floor' })
    ).rejects.toThrow(ValidationError)
  })

  it('不正な aggregationUnit は ValidationError', async () => {
    const db = createMockDb()
    await expect(
      updateConfiguration({ db: db as unknown as DbOrTx }, createAdminExecutor(), { aggregationUnit: 123 } as unknown as { aggregationUnit: 'monthly' | 'none' })
    ).rejects.toThrow(ValidationError)
  })
})
