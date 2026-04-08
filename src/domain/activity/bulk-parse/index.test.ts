import { describe, it, expect } from 'vitest'
import { parseBulkActivities } from '.'

function localISO(y: number, m: number, d: number, h: number, mi: number): string {
  return new Date(y, m - 1, d, h, mi, 0, 0).toISOString()
}

describe('parseBulkActivities', () => {
  const baseDate = '2026-04-08'

  it('YYYY/MM/DD HH:mm - YYYY/MM/DD HH:mm 形式をパースする', () => {
    const results = parseBulkActivities(
      '2026/04/01 11:00 - 2026/04/01 18:00',
      { baseDate },
    )
    expect(results).toHaveLength(1)
    const r = results[0]
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.startedAt).toBe(localISO(2026, 4, 1, 11, 0))
    expect(r.endedAt).toBe(localISO(2026, 4, 1, 18, 0))
    expect(r.note).toBeNull()
  })

  it('複数行を一気にパースする', () => {
    const text = [
      '2026/04/01 11:00 - 2026/04/01 18:00',
      '2026/04/02 10:00 - 2026/04/02 18:00',
      '2026/04/03 11:00 - 2026/04/03 18:00',
    ].join('\n')
    const results = parseBulkActivities(text, { baseDate })
    expect(results).toHaveLength(3)
    expect(results.every((r) => r.ok)).toBe(true)
  })

  it('単一日付 + 2 つの時刻をパースする', () => {
    const results = parseBulkActivities('2026/04/01 11:00 18:00', { baseDate })
    const r = results[0]
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.startedAt).toBe(localISO(2026, 4, 1, 11, 0))
    expect(r.endedAt).toBe(localISO(2026, 4, 1, 18, 0))
  })

  it('時刻のみの行は基準日を使い、note を取り出す', () => {
    const results = parseBulkActivities('11:00 18:00 会議', { baseDate })
    const r = results[0]
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.startedAt).toBe(localISO(2026, 4, 8, 11, 0))
    expect(r.endedAt).toBe(localISO(2026, 4, 8, 18, 0))
    expect(r.note).toBe('会議')
  })

  it('タブ区切りをパースする', () => {
    const results = parseBulkActivities(
      '2026/04/01\t11:00\t18:00\t打ち合わせ',
      { baseDate },
    )
    const r = results[0]
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.startedAt).toBe(localISO(2026, 4, 1, 11, 0))
    expect(r.endedAt).toBe(localISO(2026, 4, 1, 18, 0))
    expect(r.note).toBe('打ち合わせ')
  })

  it('HHmm 形式の時刻をパースする', () => {
    const results = parseBulkActivities('0900 1200', { baseDate })
    const r = results[0]
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.startedAt).toBe(localISO(2026, 4, 8, 9, 0))
    expect(r.endedAt).toBe(localISO(2026, 4, 8, 12, 0))
  })

  it('終了が開始より前の場合はエラー', () => {
    const results = parseBulkActivities(
      '2026/04/01 18:00 - 2026/04/01 11:00',
      { baseDate },
    )
    const r = results[0]
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error).toContain('終了')
  })

  it('空行はスキップする', () => {
    const text = '\n2026/04/01 11:00 - 2026/04/01 18:00\n\n'
    const results = parseBulkActivities(text, { baseDate })
    expect(results).toHaveLength(1)
  })

  it('全角チルダ区切りをパースする', () => {
    const results = parseBulkActivities('2026/04/01 11:00〜18:00', { baseDate })
    const r = results[0]
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.startedAt).toBe(localISO(2026, 4, 1, 11, 0))
    expect(r.endedAt).toBe(localISO(2026, 4, 1, 18, 0))
  })
})
