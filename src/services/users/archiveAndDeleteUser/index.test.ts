import { describe, it, expect, vi } from 'vitest'
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/api-server/errors'
import { archiveAndDeleteUser } from './'
import { createAdminExecutor, createGeneralExecutor } from '../../testing/helpers'
import type { Database } from '../../types'
import type { SupabaseClient } from '@supabase/supabase-js'

const targetUser = {
  id: 'target-user-id',
  name: 'Target User',
  role: 'general' as const,
  iconUrl: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

const userActivity = {
  id: 'act-1',
  userId: 'target-user-id',
  projectId: 'proj-1',
  startedAt: new Date('2024-06-01'),
  endedAt: null,
  note: null,
  createdAt: new Date('2024-06-01'),
  updatedAt: new Date('2024-06-01'),
}

const userAssignment = {
  id: 'asgn-1',
  projectId: 'proj-1',
  userId: 'target-user-id',
  startedAt: new Date('2024-01-01'),
  endedAt: null,
  createdAt: new Date('2024-01-01'),
}

function createChain(resolvedValue: unknown) {
  const methods = {
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
    offset: vi.fn(),
    orderBy: vi.fn(),
    leftJoin: vi.fn(),
    innerJoin: vi.fn(),
    set: vi.fn(),
    values: vi.fn(),
    returning: vi.fn().mockResolvedValue(resolvedValue),
  }
  const chain = Object.assign(Promise.resolve(resolvedValue), methods)
  const self = () => chain
  methods.from.mockImplementation(self)
  methods.where.mockImplementation(self)
  methods.limit.mockImplementation(self)
  methods.offset.mockImplementation(self)
  methods.orderBy.mockImplementation(self)
  methods.leftJoin.mockImplementation(self)
  methods.innerJoin.mockImplementation(self)
  methods.set.mockImplementation(self)
  methods.values.mockImplementation(self)
  return chain
}

function createMockTx(options?: {
  userRows?: unknown[]
  activityRows?: unknown[]
  assignmentRows?: unknown[]
}) {
  let selectCallCount = 0
  const selectResults = [
    options?.userRows ?? [targetUser],
    options?.activityRows ?? [],
    options?.assignmentRows ?? [],
  ]
  return {
    select: vi.fn(() => {
      const result = selectResults[selectCallCount] ?? []
      selectCallCount++
      return createChain(result)
    }),
    insert: vi.fn(() => createChain([])),
    update: vi.fn(() => createChain([])),
    delete: vi.fn(() => createChain([])),
  }
}

function createMockDb(txOptions?: Parameters<typeof createMockTx>[0]) {
  const tx = createMockTx(txOptions)
  return {
    transaction: vi.fn(async (fn: (tx: unknown) => Promise<void>) => {
      await fn(tx)
    }),
  } as unknown as Database
}

function createMockSupabase(options?: { deleteError?: { message: string } }) {
  return {
    auth: {
      admin: {
        deleteUser: vi.fn().mockResolvedValue({
          error: options?.deleteError ? options.deleteError : null,
        }),
      },
    },
  } as unknown as SupabaseClient
}

describe('archiveAndDeleteUser', () => {
  it('ユーザーをアーカイブして削除できる（アクティビティ・アサインメントなし）', async () => {
    const db = createMockDb({ userRows: [targetUser] })
    const supabase = createMockSupabase()
    await archiveAndDeleteUser(
      { db, supabase },
      createAdminExecutor(),
      { targetId: 'target-user-id' },
    )
    expect(supabase.auth.admin.deleteUser).toHaveBeenCalledWith('target-user-id')
  })

  it('ユーザーをアーカイブして削除できる（アクティビティ・アサインメントあり）', async () => {
    const db = createMockDb({
      userRows: [targetUser],
      activityRows: [userActivity],
      assignmentRows: [userAssignment],
    })
    const supabase = createMockSupabase()
    await archiveAndDeleteUser(
      { db, supabase },
      createAdminExecutor(),
      { targetId: 'target-user-id' },
    )
    expect(supabase.auth.admin.deleteUser).toHaveBeenCalledWith('target-user-id')
  })

  it('一般ユーザーは自分自身を削除できる', async () => {
    const generalUser = createGeneralExecutor()
    const selfTarget = { ...targetUser, id: generalUser.id }
    const db = createMockDb({ userRows: [selfTarget] })
    const supabase = createMockSupabase()
    await archiveAndDeleteUser(
      { db, supabase },
      generalUser,
      { targetId: generalUser.id },
    )
    expect(supabase.auth.admin.deleteUser).toHaveBeenCalledWith(generalUser.id)
  })

  it('一般ユーザーは他人を削除できない', async () => {
    const db = createMockDb({ userRows: [targetUser] })
    const supabase = createMockSupabase()
    await expect(
      archiveAndDeleteUser(
        { db, supabase },
        createGeneralExecutor(),
        { targetId: 'target-user-id' },
      )
    ).rejects.toThrow(ForbiddenError)
  })

  it('anonymizeName を指定してアーカイブできる', async () => {
    const db = createMockDb({ userRows: [targetUser] })
    const supabase = createMockSupabase()
    await archiveAndDeleteUser(
      { db, supabase },
      createAdminExecutor(),
      { targetId: 'target-user-id', anonymizeName: '退会ユーザー' },
    )
    expect(supabase.auth.admin.deleteUser).toHaveBeenCalledWith('target-user-id')
  })

  it('存在しないユーザーは NotFoundError', async () => {
    const db = createMockDb({ userRows: [] })
    const supabase = createMockSupabase()
    await expect(
      archiveAndDeleteUser(
        { db, supabase },
        createAdminExecutor(),
        { targetId: 'nonexistent' },
      )
    ).rejects.toThrow(NotFoundError)
  })

  it('Supabase auth 削除失敗してもエラーをスローしない（ログ出力のみ）', async () => {
    const db = createMockDb({ userRows: [targetUser] })
    const supabase = createMockSupabase({ deleteError: { message: 'Auth delete failed' } })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await archiveAndDeleteUser(
      { db, supabase },
      createAdminExecutor(),
      { targetId: 'target-user-id' },
    )
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    const supabase = createMockSupabase()
    await expect(
      archiveAndDeleteUser(
        { db, supabase },
        createAdminExecutor(),
        { targetId: 123 } as unknown as { targetId: string },
      )
    ).rejects.toThrow(ValidationError)
  })
})
