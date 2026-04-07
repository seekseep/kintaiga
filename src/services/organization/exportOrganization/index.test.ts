import { describe, it, expect, vi } from 'vitest'
import { ForbiddenError, NotFoundError } from '@/lib/api-server/errors'
import { exportOrganization } from './'
import { createMockDb, createManagerExecutor, createMemberExecutor } from '../../testing/helpers'
import type { DbOrTx } from '../../types'

const organization = {
  id: 'organization-1',
  name: 'my-org',
  displayName: 'My Org',
  plan: 'free' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const configuration = {
  id: 'cfg-1',
  organizationId: 'organization-1',
  roundingInterval: 15,
  roundingDirection: 'ceil' as const,
  aggregationUnit: 'monthly' as const,
  aggregationPeriod: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
}

function createSequentialSelectDb(results: unknown[][]) {
  let call = 0
  const make = (resolved: unknown) => {
    const methods = {
      from: vi.fn(),
      where: vi.fn(),
      limit: vi.fn(),
      offset: vi.fn(),
      orderBy: vi.fn(),
      leftJoin: vi.fn(),
      innerJoin: vi.fn(),
    }
    const chain = Object.assign(Promise.resolve(resolved), methods)
    const self = () => chain
    methods.from.mockImplementation(self)
    methods.where.mockImplementation(self)
    methods.limit.mockImplementation(self)
    methods.offset.mockImplementation(self)
    methods.orderBy.mockImplementation(self)
    methods.leftJoin.mockImplementation(self)
    methods.innerJoin.mockImplementation(self)
    return chain
  }
  return {
    select: vi.fn(() => {
      const result = results[call] ?? []
      call += 1
      return make(result)
    }),
  }
}

describe('exportOrganization', () => {
  it('マネージャー未満は ForbiddenError', async () => {
    const db = createMockDb()
    await expect(
      exportOrganization({ db: db as unknown as DbOrTx }, createMemberExecutor()),
    ).rejects.toThrow(ForbiddenError)
  })

  it('組織が存在しない場合は NotFoundError', async () => {
    const db = createSequentialSelectDb([[]])
    await expect(
      exportOrganization({ db: db as unknown as DbOrTx }, createManagerExecutor()),
    ).rejects.toThrow(NotFoundError)
  })

  it('空組織のエクスポートが成功する', async () => {
    const db = createSequentialSelectDb([
      [organization], // organizations select
      [configuration], // organizationConfigurations select
      [], // members
      [], // projects
    ])
    const result = await exportOrganization(
      { db: db as unknown as DbOrTx },
      createManagerExecutor(),
    )
    expect(result.schemaVersion).toBe(1)
    expect(result.source.organizationName).toBe('my-org')
    expect(result.organization.displayName).toBe('My Org')
    expect(result.members).toEqual([])
    expect(result.projects).toEqual([])
    expect(result.configuration.roundingInterval).toBe(15)
  })

  it('email が NULL のメンバーは除外される', async () => {
    const db = createSequentialSelectDb([
      [organization],
      [configuration],
      [
        { email: 'a@example.com', role: 'owner' },
        { email: null, role: 'worker' },
      ],
      [],
    ])
    const result = await exportOrganization(
      { db: db as unknown as DbOrTx },
      createManagerExecutor(),
    )
    expect(result.members).toEqual([{ email: 'a@example.com', role: 'owner' }])
  })
})
