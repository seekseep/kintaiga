import { describe, it, expect, vi } from 'vitest'
import { InternalError, ConflictError, ForbiddenError, ValidationError } from '@/lib/api-server/errors'
import { createUser } from './'
import { createAdminExecutor, createGeneralExecutor, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'
import type { SupabaseClient } from '@supabase/supabase-js'

const createdUser = {
  id: 'new-user-id',
  name: 'New User',
  role: 'general',
  iconUrl: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

function createMockSupabase(options?: { error?: { message: string } }) {
  return {
    auth: {
      admin: {
        createUser: vi.fn().mockResolvedValue({
          data: options?.error ? null : { user: { id: 'new-user-id' } },
          error: options?.error ?? null,
        }),
      },
    },
  } as unknown as SupabaseClient
}

describe('createUser', () => {
  it('ユーザーを作成できる', async () => {
    const db = createMockDb({ insertResult: [createdUser] })
    const supabase = createMockSupabase()
    const result = await createUser(
      { db: db as unknown as DbOrTx, supabase },
      createAdminExecutor(),
      { email: 'test@example.com', password: 'password123', name: 'New User' },
    )
    expect(result).toMatchObject({ id: 'new-user-id', name: 'New User' })
  })

  it('role を指定してユーザーを作成できる', async () => {
    const adminUser = { ...createdUser, role: 'admin' }
    const db = createMockDb({ insertResult: [adminUser] })
    const supabase = createMockSupabase()
    const result = await createUser(
      { db: db as unknown as DbOrTx, supabase },
      createAdminExecutor(),
      { email: 'admin@example.com', password: 'password123', name: 'Admin User', role: 'admin' },
    )
    expect(result).toMatchObject({ role: 'admin' })
  })

  it('一般ユーザーはユーザーを作成できない', async () => {
    const db = createMockDb()
    const supabase = createMockSupabase()
    await expect(
      createUser(
        { db: db as unknown as DbOrTx, supabase },
        createGeneralExecutor(),
        { email: 'test@example.com', password: 'password123', name: 'New User' },
      )
    ).rejects.toThrow(ForbiddenError)
  })

  it('role を省略すると general になる', async () => {
    const db = createMockDb({ insertResult: [createdUser] })
    const supabase = createMockSupabase()
    const result = await createUser(
      { db: db as unknown as DbOrTx, supabase },
      createAdminExecutor(),
      { email: 'test@example.com', password: 'password123', name: 'New User' },
    )
    expect(result).toMatchObject({ role: 'general' })
  })

  it('既に登録済みのメールアドレスは ConflictError', async () => {
    const db = createMockDb()
    const supabase = createMockSupabase({ error: { message: 'User already been registered' } })
    await expect(
      createUser(
        { db: db as unknown as DbOrTx, supabase },
        createAdminExecutor(),
        { email: 'dup@example.com', password: 'password123', name: 'Dup User' },
      )
    ).rejects.toThrow(ConflictError)
  })

  it('Supabase のその他のエラーは InternalError', async () => {
    const db = createMockDb()
    const supabase = createMockSupabase({ error: { message: 'Some other error' } })
    await expect(
      createUser(
        { db: db as unknown as DbOrTx, supabase },
        createAdminExecutor(),
        { email: 'test@example.com', password: 'password123', name: 'User' },
      )
    ).rejects.toThrow(InternalError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    const supabase = createMockSupabase()
    await expect(
      createUser(
        { db: db as unknown as DbOrTx, supabase },
        createAdminExecutor(),
        { email: 123 } as unknown as { email: string; password: string; name: string },
      )
    ).rejects.toThrow(ValidationError)
  })
})
