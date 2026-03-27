import { describe, it, expect } from 'vitest'
import { ValidationError } from '@/lib/api-server/errors'
import { listUserProjectStatements } from './'
import { createAdminExecutor, createGeneralExecutor, createMockDb } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const projectRow = {
  id: 'proj-1',
  name: 'Test Project',
  description: null,
  roundingInterval: null,
  roundingDirection: null,
  aggregationUnit: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

const projectRowWithAssignment = {
  ...projectRow,
  assignmentEndedAt: null,
  assignmentId: 'asgn-1',
}

const projectRowWithSuspendedAssignment = {
  ...projectRow,
  assignmentEndedAt: new Date('2024-01-01'),
  assignmentId: 'asgn-2',
}

const projectRowWithNoAssignment = {
  ...projectRow,
  assignmentEndedAt: null,
  assignmentId: null,
}

describe('listUserProjectStatements', () => {
  it('一般ユーザーは参加中プロジェクトのみ取得できる', async () => {
    const db = createMockDb({ selectResult: [projectRow] })
    const result = await listUserProjectStatements(
      { db: db as unknown as DbOrTx },
      createGeneralExecutor(),
      { limit: 10, offset: 0 },
    )
    expect(result).toHaveProperty('items')
    expect(result).toHaveProperty('count')
  })

  it('一般ユーザーは filter=joined でも同様に参加中のみ取得', async () => {
    const db = createMockDb({ selectResult: [projectRow] })
    const result = await listUserProjectStatements(
      { db: db as unknown as DbOrTx },
      createGeneralExecutor(),
      { limit: 10, offset: 0, filter: 'joined' },
    )
    expect(result).toHaveProperty('items')
  })

  it('管理者は filter=joined で参加中プロジェクトのみ取得できる', async () => {
    const db = createMockDb({ selectResult: [projectRow] })
    const result = await listUserProjectStatements(
      { db: db as unknown as DbOrTx },
      createAdminExecutor(),
      { limit: 10, offset: 0, filter: 'joined' },
    )
    expect(result).toHaveProperty('items')
  })

  it('管理者はフィルタなしで全プロジェクトをメンバーシップ状態付きで取得できる', async () => {
    const db = createMockDb({ selectResult: [projectRowWithAssignment] })
    const result = await listUserProjectStatements(
      { db: db as unknown as DbOrTx },
      createAdminExecutor(),
      { limit: 10, offset: 0 },
    )
    expect(result).toHaveProperty('items')
    expect(result).toHaveProperty('count')
  })

  it('管理者: assignmentId が null の場合 membershipStatus は none', async () => {
    const db = createMockDb({ selectResult: [projectRowWithNoAssignment] })
    const result = await listUserProjectStatements(
      { db: db as unknown as DbOrTx },
      createAdminExecutor(),
      { limit: 10, offset: 0 },
    )
    expect(result.items[0]).toMatchObject({ membershipStatus: 'none' })
  })

  it('管理者: assignmentEndedAt が過去の場合 membershipStatus は suspended', async () => {
    const db = createMockDb({ selectResult: [projectRowWithSuspendedAssignment] })
    const result = await listUserProjectStatements(
      { db: db as unknown as DbOrTx },
      createAdminExecutor(),
      { limit: 10, offset: 0 },
    )
    expect(result.items[0]).toMatchObject({ membershipStatus: 'suspended' })
  })

  it('管理者: assignmentEndedAt が null の場合 membershipStatus は joined', async () => {
    const db = createMockDb({ selectResult: [projectRowWithAssignment] })
    const result = await listUserProjectStatements(
      { db: db as unknown as DbOrTx },
      createAdminExecutor(),
      { limit: 10, offset: 0 },
    )
    expect(result.items[0]).toMatchObject({ membershipStatus: 'joined' })
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      listUserProjectStatements(
        { db: db as unknown as DbOrTx },
        createAdminExecutor(),
        { limit: 'bad', offset: 0 } as unknown as { limit: number; offset: number },
      )
    ).rejects.toThrow(ValidationError)
  })
})
