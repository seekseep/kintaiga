import { describe, it, expect, vi } from 'vitest'
import { NotFoundError } from '@/lib/api-server/errors'
import { syncEmail } from './'
import { createMockDb, createUserExecutor } from '../../testing/helpers'
import type { DbOrTx } from '../../types'
import type { SupabaseClient } from '@supabase/supabase-js'

function createMockSupabase(options?: { error?: object; user?: { email?: string } | null }) {
  return {
    auth: {
      admin: {
        getUserById: vi.fn().mockResolvedValue({
          data: options?.error ? null : { user: options?.user ?? { email: 'test@example.com' } },
          error: options?.error ?? null,
        }),
      },
    },
  } as unknown as SupabaseClient
}

describe('syncEmail', () => {
  const executor = createUserExecutor()
  const updatedUser = { id: 'user-id', name: 'User', email: 'test@example.com', role: 'general' as const, iconUrl: null, createdAt: new Date(), updatedAt: new Date() }

  it('Supabase からメールアドレスを同期できる', async () => {
    const db = createMockDb({ updateResult: [updatedUser] })
    const supabase = createMockSupabase({ user: { email: 'test@example.com' } })
    const result = await syncEmail({ db: db as unknown as DbOrTx, supabase }, executor)
    expect(result).toMatchObject({ id: 'user-id', email: 'test@example.com' })
  })

  it('Supabase でユーザーが見つからない場合は NotFoundError', async () => {
    const db = createMockDb()
    const supabase = createMockSupabase({ error: { message: 'User not found' } })
    await expect(
      syncEmail({ db: db as unknown as DbOrTx, supabase }, executor)
    ).rejects.toThrow(NotFoundError)
  })
})
