import { describe, it, expect, vi } from 'vitest'
import { InternalError, ValidationError } from '@/lib/api-server/errors'
import { updateIcon } from './'
import { createUserExecutor, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'
import type { SupabaseClient } from '@supabase/supabase-js'

const updatedUser = {
  id: 'general-user-id',
  name: 'General',
  role: 'general',
  iconUrl: 'https://storage.example.com/icons/general-user-id/icon.png',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-06-01'),
}

function createMockSupabase(options?: { uploadError?: Error }) {
  return {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({
          error: options?.uploadError ?? null,
        }),
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: 'https://storage.example.com/icons/general-user-id/icon.png' },
        })),
      })),
    },
  } as unknown as SupabaseClient
}

const validBase64Icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

describe('updateIcon', () => {
  it('アイコンを更新できる', async () => {
    const db = createMockDb({ updateResult: [updatedUser] })
    const supabase = createMockSupabase()
    const result = await updateIcon(
      { db: db as unknown as DbOrTx, supabase },
      createUserExecutor({ user: { id: 'general-user-id' } }),
      { icon: validBase64Icon },
    )
    expect(result).toMatchObject({ id: 'general-user-id', iconUrl: expect.any(String) })
  })

  it('Supabase アップロードエラー時は InternalError', async () => {
    const db = createMockDb({ updateResult: [updatedUser] })
    const supabase = createMockSupabase({ uploadError: new Error('Upload failed') })
    await expect(
      updateIcon(
        { db: db as unknown as DbOrTx, supabase },
        createUserExecutor({ user: { id: 'general-user-id' } }),
        { icon: validBase64Icon },
      )
    ).rejects.toThrow(InternalError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    const supabase = createMockSupabase()
    await expect(
      updateIcon(
        { db: db as unknown as DbOrTx, supabase },
        createUserExecutor({ user: { id: 'general-user-id' } }),
        { icon: 123 } as unknown as { icon: string },
      )
    ).rejects.toThrow(ValidationError)
  })
})
