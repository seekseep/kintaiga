import { describe, it, expect } from 'vitest'
import { combineProjectMembers } from './combine'
import type { ProjectMember } from '@/schemas'

function makeMember(overrides: Partial<ProjectMember>): ProjectMember {
  return {
    projectAssignmentId: 'a1',
    userId: 'u1',
    name: '横山',
    role: 'general',
    iconUrl: null,
    active: true,
    targetMinutes: null,
    startedAt: '2026-05-01T00:00:00.000Z',
    endedAt: null,
    ...overrides,
  }
}

describe('combineProjectMembers', () => {
  it('単一の assignment はそのまま返す', () => {
    const m = makeMember({})
    expect(combineProjectMembers([m])).toEqual([m])
  })

  it('別 userId は集約しない', () => {
    const a = makeMember({ userId: 'u1' })
    const b = makeMember({ userId: 'u2', projectAssignmentId: 'a2' })
    const result = combineProjectMembers([a, b])
    expect(result).toHaveLength(2)
  })

  it('同 userId の複数 assignment を 1 つに集約する', () => {
    const a = makeMember({
      projectAssignmentId: 'a1',
      startedAt: '2026-05-01T00:00:00.000Z',
      endedAt: '2026-05-31T00:00:00.000Z',
      targetMinutes: 2400,
    })
    const b = makeMember({
      projectAssignmentId: 'a2',
      startedAt: '2026-05-01T00:00:00.000Z',
      endedAt: '2026-05-31T00:00:00.000Z',
      targetMinutes: 2400,
    })
    const result = combineProjectMembers([a, b])
    expect(result).toHaveLength(1)
    expect(result[0].targetMinutes).toBe(4800)
  })

  it('期間が異なる場合、最早 startedAt と最遅 endedAt を採用する', () => {
    const a = makeMember({
      projectAssignmentId: 'a1',
      startedAt: '2026-05-01T00:00:00.000Z',
      endedAt: '2026-05-31T00:00:00.000Z',
    })
    const b = makeMember({
      projectAssignmentId: 'a2',
      startedAt: '2026-06-01T00:00:00.000Z',
      endedAt: '2026-06-30T00:00:00.000Z',
    })
    const [combined] = combineProjectMembers([a, b])
    expect(combined.startedAt).toBe('2026-05-01T00:00:00.000Z')
    expect(combined.endedAt).toBe('2026-06-30T00:00:00.000Z')
  })

  it('いずれかが endedAt=null なら集約後も null', () => {
    const a = makeMember({ projectAssignmentId: 'a1', endedAt: '2026-05-31T00:00:00.000Z' })
    const b = makeMember({ projectAssignmentId: 'a2', endedAt: null })
    const [combined] = combineProjectMembers([a, b])
    expect(combined.endedAt).toBeNull()
  })

  it('targetMinutes が全て null なら集約後も null', () => {
    const a = makeMember({ projectAssignmentId: 'a1', targetMinutes: null })
    const b = makeMember({ projectAssignmentId: 'a2', targetMinutes: null })
    const [combined] = combineProjectMembers([a, b])
    expect(combined.targetMinutes).toBeNull()
  })

  it('片方だけ targetMinutes に値があれば合算 (null を 0 とみなす)', () => {
    const a = makeMember({ projectAssignmentId: 'a1', targetMinutes: 1200 })
    const b = makeMember({ projectAssignmentId: 'a2', targetMinutes: null })
    const [combined] = combineProjectMembers([a, b])
    expect(combined.targetMinutes).toBe(1200)
  })

  it('いずれかが active なら集約後も active', () => {
    const a = makeMember({ projectAssignmentId: 'a1', active: false })
    const b = makeMember({ projectAssignmentId: 'a2', active: true })
    const [combined] = combineProjectMembers([a, b])
    expect(combined.active).toBe(true)
  })
})
