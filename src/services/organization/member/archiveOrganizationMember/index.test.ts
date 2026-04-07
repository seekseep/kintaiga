import { describe, it, expect, vi } from 'vitest'
import { ValidationError, ForbiddenError } from '@/lib/api-server/errors'
import { archiveOrganizationMember } from '.'
import { createOwnerExecutor, createMemberExecutor } from '../../../testing/helpers'
import type { Database } from '../../../types'

const project = { id: 'proj-1' }

const activity = {
  id: '11111111-1111-1111-1111-111111111111',
  userId: '22222222-2222-4222-8222-222222222222',
  projectId: 'proj-1',
  startedAt: new Date('2024-06-01'),
  endedAt: null,
  note: null,
  createdAt: new Date('2024-06-01'),
  updatedAt: new Date('2024-06-01'),
}

const assignment = {
  id: '33333333-3333-3333-3333-333333333333',
  projectId: 'proj-1',
  userId: '22222222-2222-4222-8222-222222222222',
  startedAt: new Date('2024-01-01'),
  endedAt: null,
  targetMinutes: null,
  createdAt: new Date('2024-01-01'),
}

function createChain(resolvedValue: unknown) {
  const methods = {
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
    values: vi.fn(),
  }
  const chain = Object.assign(Promise.resolve(resolvedValue), methods)
  const self = () => chain
  methods.from.mockImplementation(self)
  methods.where.mockImplementation(self)
  methods.limit.mockImplementation(self)
  methods.values.mockImplementation(self)
  return chain
}

function createMockTx(options?: {
  projectRows?: unknown[]
  activityRows?: unknown[]
  assignmentRows?: unknown[]
}) {
  let selectCallCount = 0
  const selectResults = [
    options?.projectRows ?? [project],
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

const validInput = { userId: '22222222-2222-4222-8222-222222222222' }

describe('archiveOrganizationMember', () => {
  it('対象データが無くてもエラーにならない', async () => {
    const db = createMockDb()
    await expect(
      archiveOrganizationMember({ db }, createOwnerExecutor(), validInput),
    ).resolves.toBeUndefined()
  })

  it('組織内プロジェクトが無い場合はそのまま終了', async () => {
    const db = createMockDb({ projectRows: [] })
    await expect(
      archiveOrganizationMember({ db }, createOwnerExecutor(), validInput),
    ).resolves.toBeUndefined()
  })

  it('アクティビティとアサインメントを退避できる', async () => {
    const db = createMockDb({ activityRows: [activity], assignmentRows: [assignment] })
    await archiveOrganizationMember({ db }, createOwnerExecutor(), validInput)
    expect(db.transaction).toHaveBeenCalled()
  })

  it('権限がなければ ForbiddenError', async () => {
    const db = createMockDb()
    await expect(
      archiveOrganizationMember({ db }, createMemberExecutor(), validInput),
    ).rejects.toThrow(ForbiddenError)
  })

  it('userId が UUID でない場合は ValidationError', async () => {
    const db = createMockDb()
    await expect(
      archiveOrganizationMember({ db }, createOwnerExecutor(), { userId: 'invalid' }),
    ).rejects.toThrow(ValidationError)
  })
})
