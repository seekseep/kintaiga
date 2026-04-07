import { describe, it, expect, vi } from 'vitest'
import { ConflictError, ForbiddenError, ValidationError } from '@/lib/api-server/errors'
import { createUser } from '.'
import { createUserExecutor, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'
import type { SupabaseClient } from '@supabase/supabase-js'

const createdUser = {
  id: 'user-id',
  name: 'New User',
  role: 'general',
  iconUrl: null,
  email: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

function createMockSupabase() {
  return {
    auth: {
      admin: {
        updateUserById: vi.fn().mockResolvedValue({ data: {}, error: null }),
      },
    },
  } as unknown as SupabaseClient
}

describe('createUser', () => {
  it('自分自身のプロフィールを作成できる', async () => {
    const db = createMockDb({ insertResult: [createdUser] })
    const supabase = createMockSupabase()
    const result = await createUser(
      { db: db as unknown as DbOrTx, supabase },
      createUserExecutor({ user: { id: 'user-id' } }),
      { userId: 'user-id', name: 'New User' },
    )
    expect(result).toMatchObject({ id: 'user-id', name: 'New User' })
    expect(supabase.auth.admin.updateUserById).toHaveBeenCalledWith('user-id', {
      app_metadata: { role: 'general' },
    })
  })

  it('admin は他人のプロフィールを作成できる', async () => {
    const db = createMockDb({ insertResult: [{ ...createdUser, id: 'other-id' }] })
    const supabase = createMockSupabase()
    const result = await createUser(
      { db: db as unknown as DbOrTx, supabase },
      createUserExecutor({ user: { id: 'admin-id', role: 'admin' } }),
      { userId: 'other-id', name: 'Other' },
    )
    expect(result).toMatchObject({ id: 'other-id' })
  })

  it('一般ユーザーは他人のプロフィールを作成できない', async () => {
    const db = createMockDb()
    const supabase = createMockSupabase()
    await expect(
      createUser(
        { db: db as unknown as DbOrTx, supabase },
        createUserExecutor({ user: { id: 'user-id' } }),
        { userId: 'other-id', name: 'Other' },
      )
    ).rejects.toThrow(ForbiddenError)
  })

  it('既に登録済みの場合は ConflictError', async () => {
    const db = createMockDb({ selectResult: [createdUser] })
    const supabase = createMockSupabase()
    await expect(
      createUser(
        { db: db as unknown as DbOrTx, supabase },
        createUserExecutor({ user: { id: 'user-id' } }),
        { userId: 'user-id', name: 'Duplicate' },
      )
    ).rejects.toThrow(ConflictError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    const supabase = createMockSupabase()
    await expect(
      createUser(
        { db: db as unknown as DbOrTx, supabase },
        createUserExecutor({ user: { id: 'user-id' } }),
        { userId: 'user-id', name: '' },
      )
    ).rejects.toThrow(ValidationError)
  })
})
