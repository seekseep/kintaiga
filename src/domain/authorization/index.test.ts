import { describe, it, expect } from 'vitest'
import {
  canControlActivity,
  canModifyUser,
  canChangeRole,
  canCreateActivityForUser,
  canActAsAdmin,
  canActAsOrganizationOwner,
  canActAsOrganizationManager,
  canManageOrganizationMembers,
  canManageOrganizationProjects,
  canCreateReport,
  canTransferOwnership,
  canControlActivityInOrganization,
} from '.'
import type { OrganizationExecutor } from '@/services/types'

// --- System-level tests (既存) ---

describe('canControlActivity', () => {
  it('admin は誰のアクティビティも操作できる', () => {
    expect(canControlActivity({ role: 'admin', id: 'user-1' }, { userId: 'user-2' })).toBe(true)
  })

  it('general は自分のアクティビティのみ操作できる', () => {
    expect(canControlActivity({ role: 'general', id: 'user-1' }, { userId: 'user-1' })).toBe(true)
    expect(canControlActivity({ role: 'general', id: 'user-1' }, { userId: 'user-2' })).toBe(false)
  })
})

describe('canModifyUser', () => {
  it('admin は誰のプロフィールも変更できる', () => {
    expect(canModifyUser({ user: { role: 'admin', id: 'user-1' } }, 'user-2')).toBe(true)
  })

  it('general は自分のプロフィールのみ変更できる', () => {
    expect(canModifyUser({ user: { role: 'general', id: 'user-1' } }, 'user-1')).toBe(true)
    expect(canModifyUser({ user: { role: 'general', id: 'user-1' } }, 'user-2')).toBe(false)
  })
})

describe('canChangeRole', () => {
  it('admin のみ true', () => {
    expect(canChangeRole({ user: { role: 'admin' } })).toBe(true)
    expect(canChangeRole({ user: { role: 'general' } })).toBe(false)
  })
})

describe('canCreateActivityForUser', () => {
  it('admin は他ユーザーの代理作成が可能', () => {
    expect(canCreateActivityForUser({ user: { role: 'admin', id: 'user-1' } }, 'user-2')).toBe(true)
  })

  it('general は自分のみ', () => {
    expect(canCreateActivityForUser({ user: { role: 'general', id: 'user-1' } }, 'user-1')).toBe(true)
    expect(canCreateActivityForUser({ user: { role: 'general', id: 'user-1' } }, 'user-2')).toBe(false)
  })
})

describe('canActAsAdmin', () => {
  it('ロール判定', () => {
    expect(canActAsAdmin({ user: { role: 'admin' } })).toBe(true)
    expect(canActAsAdmin({ user: { role: 'general' } })).toBe(false)
  })
})

// --- Organization-level tests ---

function createExecutor(overrides?: {
  user?: Partial<OrganizationExecutor['user']>
  organization?: Partial<OrganizationExecutor['organization']>
}): OrganizationExecutor {
  return {
    type: 'organization',
    user: { id: 'user-1', role: 'general', ...overrides?.user },
    organization: { id: 'organization-1', role: 'worker', plan: 'free', ...overrides?.organization },
  }
}

describe('canActAsOrganizationOwner', () => {
  it('owner は true', () => {
    expect(canActAsOrganizationOwner(createExecutor({ organization: { role: 'owner' } }))).toBe(true)
  })

  it('manager は false', () => {
    expect(canActAsOrganizationOwner(createExecutor({ organization: { role: 'manager' } }))).toBe(false)
  })

  it('member は false', () => {
    expect(canActAsOrganizationOwner(createExecutor({ organization: { role: 'worker' } }))).toBe(false)
  })

  it('system admin は true', () => {
    expect(canActAsOrganizationOwner(createExecutor({ user: { role: 'admin' }, organization: { role: 'worker' } }))).toBe(true)
  })
})

describe('canActAsOrganizationManager', () => {
  it('owner は true', () => {
    expect(canActAsOrganizationManager(createExecutor({ organization: { role: 'owner' } }))).toBe(true)
  })

  it('manager は true', () => {
    expect(canActAsOrganizationManager(createExecutor({ organization: { role: 'manager' } }))).toBe(true)
  })

  it('member は false', () => {
    expect(canActAsOrganizationManager(createExecutor({ organization: { role: 'worker' } }))).toBe(false)
  })

  it('system admin は true', () => {
    expect(canActAsOrganizationManager(createExecutor({ user: { role: 'admin' }, organization: { role: 'worker' } }))).toBe(true)
  })
})

describe('canManageOrganizationMembers', () => {
  it('owner は管理可能', () => {
    expect(canManageOrganizationMembers(createExecutor({ organization: { role: 'owner' } }))).toBe(true)
  })

  it('manager は管理可能', () => {
    expect(canManageOrganizationMembers(createExecutor({ organization: { role: 'manager' } }))).toBe(true)
  })

  it('member は管理不可', () => {
    expect(canManageOrganizationMembers(createExecutor({ organization: { role: 'worker' } }))).toBe(false)
  })
})

describe('canManageOrganizationProjects', () => {
  it('owner は管理可能', () => {
    expect(canManageOrganizationProjects(createExecutor({ organization: { role: 'owner' } }))).toBe(true)
  })

  it('manager は管理可能', () => {
    expect(canManageOrganizationProjects(createExecutor({ organization: { role: 'manager' } }))).toBe(true)
  })

  it('member は管理不可', () => {
    expect(canManageOrganizationProjects(createExecutor({ organization: { role: 'worker' } }))).toBe(false)
  })
})

describe('canCreateReport', () => {
  it('premium の owner/manager は作成可能', () => {
    expect(canCreateReport(createExecutor({ organization: { role: 'owner', plan: 'premium' } }))).toBe(true)
    expect(canCreateReport(createExecutor({ organization: { role: 'manager', plan: 'premium' } }))).toBe(true)
  })

  it('free プランでは作成不可', () => {
    expect(canCreateReport(createExecutor({ organization: { role: 'owner', plan: 'free' } }))).toBe(false)
    expect(canCreateReport(createExecutor({ organization: { role: 'manager', plan: 'free' } }))).toBe(false)
  })

  it('premium でも member は作成不可', () => {
    expect(canCreateReport(createExecutor({ organization: { role: 'worker', plan: 'premium' } }))).toBe(false)
  })

  it('system admin + premium は作成可能', () => {
    expect(canCreateReport(createExecutor({ user: { role: 'admin' }, organization: { role: 'worker', plan: 'premium' } }))).toBe(true)
  })
})

describe('canTransferOwnership', () => {
  it('owner は移譲可能', () => {
    expect(canTransferOwnership(createExecutor({ organization: { role: 'owner' } }))).toBe(true)
  })

  it('manager は移譲不可', () => {
    expect(canTransferOwnership(createExecutor({ organization: { role: 'manager' } }))).toBe(false)
  })

  it('member は移譲不可', () => {
    expect(canTransferOwnership(createExecutor({ organization: { role: 'worker' } }))).toBe(false)
  })

  it('system admin は移譲可能', () => {
    expect(canTransferOwnership(createExecutor({ user: { role: 'admin' }, organization: { role: 'worker' } }))).toBe(true)
  })
})

describe('canControlActivityInOrganization', () => {
  it('owner は他人のアクティビティも操作可能', () => {
    expect(canControlActivityInOrganization(createExecutor({ organization: { role: 'owner' } }), { userId: 'user-2' })).toBe(true)
  })

  it('manager は他人のアクティビティも操作可能', () => {
    expect(canControlActivityInOrganization(createExecutor({ organization: { role: 'manager' } }), { userId: 'user-2' })).toBe(true)
  })

  it('member は自分のアクティビティのみ操作可能', () => {
    expect(canControlActivityInOrganization(createExecutor({ user: { id: 'user-1' }, organization: { role: 'worker' } }), { userId: 'user-1' })).toBe(true)
    expect(canControlActivityInOrganization(createExecutor({ user: { id: 'user-1' }, organization: { role: 'worker' } }), { userId: 'user-2' })).toBe(false)
  })

  it('system admin は全操作可能', () => {
    expect(canControlActivityInOrganization(createExecutor({ user: { role: 'admin' }, organization: { role: 'worker' } }), { userId: 'user-2' })).toBe(true)
  })
})
