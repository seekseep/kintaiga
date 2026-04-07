import { describe, it, expect } from 'vitest'
import { ValidationError, ForbiddenError } from '@/lib/api-server/errors'
import { importOrganization } from './'
import { createMockDb, createManagerExecutor, createMemberExecutor } from '../../testing/helpers'
import type { Database } from '../../types'

describe('importOrganization', () => {
  it('マネージャー未満は ForbiddenError', async () => {
    const db = createMockDb()
    await expect(
      importOrganization(
        { db: db as unknown as Database },
        createMemberExecutor(),
        { payload: { invalid: true } as never },
      ),
    ).rejects.toThrow(ForbiddenError)
  })

  it('payload が不正な場合は ValidationError', async () => {
    const db = createMockDb()
    await expect(
      importOrganization(
        { db: db as unknown as Database },
        createManagerExecutor(),
        { payload: { invalid: true } as never },
      ),
    ).rejects.toThrow(ValidationError)
  })
})
