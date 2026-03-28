import { describe, it, expect } from 'vitest'
import { ForbiddenError, ValidationError } from '@/lib/api-server/errors'
import { createOrganizationMemberReport } from './'
import { createMockDb, createOwnerExecutor, createMemberExecutor } from '../../../../testing/helpers'
import type { DbOrTx } from '../../../../types'

const createdReport = {
  id: 'report-1',
  publicId: 'abc123',
  organizationId: 'organization-1',
  userId: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Monthly Report',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  createdAt: new Date(),
}

describe('createOrganizationMemberReport', () => {
  it('Premiumプランのマネージャーがレポー���を作成できる', async () => {
    const db = createMockDb({ insertResult: [createdReport] })
    const result = await createOrganizationMemberReport(
      { db: db as unknown as DbOrTx },
      createOwnerExecutor({ organization: { plan: 'premium' } }),
      { userId: '550e8400-e29b-41d4-a716-446655440000', name: 'Monthly Report', startDate: '2024-01-01T00:00:00', endDate: '2024-01-31T23:59:59' },
    )
    expect(result).toMatchObject({ id: 'report-1', name: 'Monthly Report' })
  })

  it('Freeプランではレポートを作成できない', async () => {
    const db = createMockDb()
    await expect(
      createOrganizationMemberReport(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor({ organization: { plan: 'free' } }),
        { userId: '550e8400-e29b-41d4-a716-446655440000', name: 'Report', startDate: '2024-01-01T00:00:00', endDate: '2024-01-31T23:59:59' },
      )
    ).rejects.toThrow(ForbiddenError)
  })

  it('一般メンバーはレポートを作成できない', async () => {
    const db = createMockDb()
    await expect(
      createOrganizationMemberReport(
        { db: db as unknown as DbOrTx },
        createMemberExecutor({ organization: { plan: 'premium' } }),
        { userId: '550e8400-e29b-41d4-a716-446655440000', name: 'Report', startDate: '2024-01-01T00:00:00', endDate: '2024-01-31T23:59:59' },
      )
    ).rejects.toThrow(ForbiddenError)
  })

  it('不正なパラメータは ValidationError', async () => {
    const db = createMockDb()
    await expect(
      createOrganizationMemberReport(
        { db: db as unknown as DbOrTx },
        createOwnerExecutor({ organization: { plan: 'premium' } }),
        { userId: 'not-uuid', name: '', startDate: 'invalid', endDate: 'invalid' },
      )
    ).rejects.toThrow(ValidationError)
  })
})
