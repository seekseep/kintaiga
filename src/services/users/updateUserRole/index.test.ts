import { describe, it, expect, vi } from 'vitest'
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/api-server/errors'
import { updateUserRole } from './'
import { createAdminExecutor, createGeneralExecutor, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

function createMockSupabase(overrides?: { error?: Error }) {
  return {
    auth: {
      admin: {
        updateUserById: vi.fn().mockResolvedValue({
          data: { user: { id: 'target-user-id' } },
          error: overrides?.error ?? null,
        }),
      },
    },
  }
}

const updatedUser = {
  id: 'target-user-id',
  name: 'Target',
  role: 'admin' as const,
  iconUrl: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date(),
}

describe('updateUserRole', () => {
  it('管理者はロールを変更できる', async () => {
    const supabase = createMockSupabase()
    const db = createMockDb({ updateResult: [updatedUser] })
    const result = await updateUserRole(
      { db: db as unknown as DbOrTx, supabase: supabase as any },
      createAdminExecutor(),
      { id: 'target-user-id', role: 'admin' },
    )
    expect(result).toMatchObject({ id: 'target-user-id', role: 'admin' })
    expect(supabase.auth.admin.updateUserById).toHaveBeenCalledWith('target-user-id', {
      app_metadata: { role: 'admin' },
    })
  })

  it('一般ユーザーはロールを変更できない', async () => {
    const supabase = createMockSupabase()
    const db = createMockDb()
    await expect(
      updateUserRole({ db: db as unknown as DbOrTx, supabase: supabase as any }, createGeneralExecutor(), { id: 'target-user-id', role: 'admin' })
    ).rejects.toThrow(ForbiddenError)
  })

  it('存在しないユーザーの更新は NotFoundError', async () => {
    const supabase = createMockSupabase()
    const db = createMockDb({ updateResult: [] })
    await expect(
      updateUserRole({ db: db as unknown as DbOrTx, supabase: supabase as any }, createAdminExecutor(), { id: 'nonexistent', role: 'admin' })
    ).rejects.toThrow(NotFoundError)
  })

  it('不正なロールは ValidationError', async () => {
    const supabase = createMockSupabase()
    const db = createMockDb()
    await expect(
      updateUserRole({ db: db as unknown as DbOrTx, supabase: supabase as any }, createAdminExecutor(), { id: 'target-user-id', role: 'superadmin' } as any)
    ).rejects.toThrow(ValidationError)
  })
})
