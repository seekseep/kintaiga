import { describe, it, expect } from 'vitest'
import { NotFoundError } from '@/lib/api-server/errors'
import { getOrganizationMemberReportByPublicId } from './'
import { createMockDb } from '../../../../testing/helpers'
import type { DbOrTx } from '../../../../types'

const report = {
  id: 'report-1',
  publicId: 'abc123',
  organizationId: 'org-1',
  userId: 'user-1',
  name: 'Monthly Report',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  createdAt: new Date(),
}

describe('getOrganizationMemberReportByPublicId', () => {
  it('公開IDでレポートを取得できる', async () => {
    const db = createMockDb({
      selectResult: [report],
    })
    const result = await getOrganizationMemberReportByPublicId(
      { db: db as unknown as DbOrTx },
      'abc123',
    )
    expect(result).toMatchObject({
      report: { name: 'Monthly Report' },
    })
  })

  it('レポートが見つからない場合は NotFoundError', async () => {
    const db = createMockDb({ selectResult: [] })
    await expect(
      getOrganizationMemberReportByPublicId(
        { db: db as unknown as DbOrTx },
        'not-found',
      )
    ).rejects.toThrow(NotFoundError)
  })
})
