import { describe, it, expect } from 'vitest'
import { parseBulkActivities } from '.'

function localISO(y: number, m: number, d: number, h: number, mi: number): string {
  return new Date(y, m - 1, d, h, mi, 0, 0).toISOString()
}

describe('parseBulkActivities', () => {
  it('「日時,日時,内容」形式をパースする', () => {
    const results = parseBulkActivities(
      '2026/04/01 11:00,2026/04/01 18:00,打ち合わせ',
    )
    expect(results).toHaveLength(1)
    const r = results[0]
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.startedAt).toBe(localISO(2026, 4, 1, 11, 0))
    expect(r.endedAt).toBe(localISO(2026, 4, 1, 18, 0))
    expect(r.note).toBe('打ち合わせ')
  })

  it('内容を省略できる', () => {
    const results = parseBulkActivities('2026/04/01 11:00,2026/04/01 18:00')
    const r = results[0]
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.note).toBeNull()
  })

  it('複数行を一気にパースする', () => {
    const text = [
      '2026/04/01 11:00,2026/04/01 18:00,A',
      '2026/04/02 10:00,2026/04/02 18:00,B',
      '2026/04/03 11:00,2026/04/03 18:00,C',
    ].join('\n')
    const results = parseBulkActivities(text)
    expect(results).toHaveLength(3)
    expect(results.every((r) => r.ok)).toBe(true)
  })

  it('終了が開始より前の場合はエラー', () => {
    const results = parseBulkActivities(
      '2026/04/01 18:00,2026/04/01 11:00',
    )
    const r = results[0]
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error).toContain('終了')
  })

  it('カンマ区切りでない行はエラー', () => {
    const results = parseBulkActivities('2026/04/01 11:00 - 2026/04/01 18:00')
    const r = results[0]
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error).toContain('日時,日時,内容')
  })

  it('日時の形式が不正な場合はエラー', () => {
    const results = parseBulkActivities('2026/04/01,2026/04/01 18:00')
    const r = results[0]
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error).toContain('開始日時')
  })

  it('空行はスキップする', () => {
    const text = '\n2026/04/01 11:00,2026/04/01 18:00\n\n'
    const results = parseBulkActivities(text)
    expect(results).toHaveLength(1)
  })

  it('YYYY-MM-DD 区切りも受け付ける', () => {
    const results = parseBulkActivities('2026-04-01 11:00,2026-04-01 18:00')
    const r = results[0]
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.startedAt).toBe(localISO(2026, 4, 1, 11, 0))
    expect(r.endedAt).toBe(localISO(2026, 4, 1, 18, 0))
  })
})
