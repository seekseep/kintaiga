import { describe, it, expect } from 'vitest'
import {
  canControlActivity,
  canModifyUser,
  canChangeRole,
  canCreateActivityForUser,
  isAdmin,
} from '.'

describe('canControlActivity', () => {
  it('admin は誰のアクティビティも操作できる', () => {
    expect(canControlActivity('admin', 'user-1', 'user-2')).toBe(true)
  })

  it('general は自分のアクティビティのみ操作できる', () => {
    expect(canControlActivity('general', 'user-1', 'user-1')).toBe(true)
    expect(canControlActivity('general', 'user-1', 'user-2')).toBe(false)
  })
})

describe('canModifyUser', () => {
  it('admin は誰のプロフィールも変更できる', () => {
    expect(canModifyUser('admin', 'user-1', 'user-2')).toBe(true)
  })

  it('general は自分のプロフィールのみ変更できる', () => {
    expect(canModifyUser('general', 'user-1', 'user-1')).toBe(true)
    expect(canModifyUser('general', 'user-1', 'user-2')).toBe(false)
  })
})

describe('canChangeRole', () => {
  it('admin のみ true', () => {
    expect(canChangeRole('admin')).toBe(true)
    expect(canChangeRole('general')).toBe(false)
  })
})

describe('canCreateActivityForUser', () => {
  it('admin は他ユーザーの代理作成が可能', () => {
    expect(canCreateActivityForUser('admin', 'user-1', 'user-2')).toBe(true)
  })

  it('general は自分のみ', () => {
    expect(canCreateActivityForUser('general', 'user-1', 'user-1')).toBe(true)
    expect(canCreateActivityForUser('general', 'user-1', 'user-2')).toBe(false)
  })
})

describe('isAdmin', () => {
  it('ロール判定', () => {
    expect(isAdmin('admin')).toBe(true)
    expect(isAdmin('general')).toBe(false)
  })
})
