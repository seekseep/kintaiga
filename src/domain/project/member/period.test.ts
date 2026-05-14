import { describe, it, expect } from 'vitest'
import { periodsOverlap } from './period'

const d = (s: string) => new Date(s)

describe('periodsOverlap', () => {
  it('完全に同一の期間は重複', () => {
    expect(periodsOverlap(
      { startedAt: d('2026-05-01'), endedAt: d('2026-05-31') },
      { startedAt: d('2026-05-01'), endedAt: d('2026-05-31') },
    )).toBe(true)
  })

  it('一部交差する期間は重複', () => {
    expect(periodsOverlap(
      { startedAt: d('2026-05-01'), endedAt: d('2026-05-31') },
      { startedAt: d('2026-05-15'), endedAt: d('2026-06-15') },
    )).toBe(true)
  })

  it('完全に離れた期間は重複しない', () => {
    expect(periodsOverlap(
      { startedAt: d('2026-05-01'), endedAt: d('2026-05-31') },
      { startedAt: d('2026-06-01'), endedAt: d('2026-06-30') },
    )).toBe(false)
  })

  it('境界が一致するときは重複とみなす', () => {
    expect(periodsOverlap(
      { startedAt: d('2026-05-01'), endedAt: d('2026-05-31') },
      { startedAt: d('2026-05-31'), endedAt: d('2026-06-30') },
    )).toBe(true)
  })

  it('endedAt=null は永続として後続と重複', () => {
    expect(periodsOverlap(
      { startedAt: d('2026-05-01'), endedAt: null },
      { startedAt: d('2027-01-01'), endedAt: d('2027-01-31') },
    )).toBe(true)
  })

  it('両方が永続なら重複', () => {
    expect(periodsOverlap(
      { startedAt: d('2026-05-01'), endedAt: null },
      { startedAt: d('2027-01-01'), endedAt: null },
    )).toBe(true)
  })

  it('永続だが片方が他方より後に始まる場合も重複', () => {
    expect(periodsOverlap(
      { startedAt: d('2027-01-01'), endedAt: null },
      { startedAt: d('2026-05-01'), endedAt: d('2026-05-31') },
    )).toBe(false)
  })
})
