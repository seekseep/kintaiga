import { describe, it, expect } from 'vitest'
import { ForbiddenError } from '@/lib/api-server/errors'
import { listOrganizationMemberReports } from './'
import { createMockDb, createOwnerExecutor, createMemberExecutor } from '../../../../testing/helpers'
import type { DbOrTx } from '../../../../types'

const reportRow = {
  id: 'report-1',
  publicId: 'abc123',
  userId: 'user-1',
  userName: 'User 1',
  name: 'Monthly Report',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  createdAt: new Date(),
}

describe('listOrganizationMemberReports', () => {
  it('マネージャー以上がレポート一覧を取得できる', async () => {
    const db = createMockDb({ selectResult: [reportRow] })
    const result = await listOrganizationMemberReports(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
    )
    expect(result).toMatchObject([{ id: 'report-1', name: 'Monthly Report' }])
  })

  it('一般メンバーはレポート一覧を取得できない', async () => {
    const db = createMockDb()
    await expect(
      listOrganizationMemberReports(
        { db: db as unknown as DbOrTx },
        createMemberExecutor(),
      )
    ).rejects.toThrow(ForbiddenError)
  })
})
