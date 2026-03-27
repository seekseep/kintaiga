import { describe, it, expect, vi } from 'vitest'
import { ForbiddenError, ValidationError } from '@/lib/api-server/errors'
import { updateUserRole } from './'
import { createAdminExecutor, createGeneralExecutor } from '../../testing/helpers'

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

describe('updateUserRole', () => {
  it('管理者はロールを変更できる', async () => {
    const supabase = createMockSupabase()
    const result = await updateUserRole(
      { supabase: supabase as any },
      createAdminExecutor(),
      { id: 'target-user-id', role: 'admin' },
    )
    expect(result).toEqual({ id: 'target-user-id', role: 'admin' })
    expect(supabase.auth.admin.updateUserById).toHaveBeenCalledWith('target-user-id', {
      app_metadata: { role: 'admin' },
    })
  })

  it('一般ユーザーはロールを変更できない', async () => {
    const supabase = createMockSupabase()
    await expect(
      updateUserRole({ supabase: supabase as any }, createGeneralExecutor(), { id: 'target-user-id', role: 'admin' })
    ).rejects.toThrow(ForbiddenError)
  })

  it('不正なロールは ValidationError', async () => {
    const supabase = createMockSupabase()
    await expect(
      updateUserRole({ supabase: supabase as any }, createAdminExecutor(), { id: 'target-user-id', role: 'superadmin' } as any)
    ).rejects.toThrow(ValidationError)
  })
})
