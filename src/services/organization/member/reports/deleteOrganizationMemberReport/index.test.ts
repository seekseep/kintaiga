import { describe, it, expect } from 'vitest'
import { ForbiddenError, ValidationError, NotFoundError } from '@/lib/api-server/errors'
import { deleteOrganizationMemberReport } from './'
import { createMockDb, createOwnerExecutor, createMemberExecutor } from '../../../../testing/helpers'
import type { DbOrTx } from '../../../../types'

const deletedReport = { id: 'report-1', publicId: 'abc123', organizationId: 'organization-1', userId: 'user-1', name: 'Report', startDate: new Date(), endDate: new Date(), createdAt: new Date() }

describe('deleteOrganizationMemberReport', () => {
  it('マネージャー以上がレポートを削除できる', async () => {
    const db = createMockDb({ deleteResult: [deletedReport] })
    const result = await deleteOrganizationMemberReport(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor(),
      { id: 'report-1' },
    )
    expect(result).toMatchObject({ id: 'report-1' })
  })

  it('一般メンバーはレポートを削除できない', async () => {
    const db = createMockDb()
    await expect(
      deleteOrganizationMemberReport(
        { db: db as unknown as DbOrTx },
        createMemberExecutor(),
        { id: 'report-1' },
      )
    ).rejects.toThrow(ForbiddenError)
  })

  it('レポートが見つからない場合は NotFoundError', async () => {
    const db = createMockDb({ deleteResult: [] })
    await expect(
      deleteOrganizationMemberReport(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { id: 'not-found' },
      )
    ).rejects.toThrow(NotFoundError)
  })

  it('不正なパ��メータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      deleteOrganizationMemberReport(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor(),
        { id: 123 } as unknown as { id: string },
      )
    ).rejects.toThrow(ValidationError)
  })
})
