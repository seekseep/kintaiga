import { describe, it, expect } from 'vitest'
import { getMonthRange, filterActivitiesByMonth, calculateTotalMinutes } from '.'

describe('getMonthRange', () => {
  it('指定日の月初と月末を返す', () => {
    const { start, end } = getMonthRange(new Date('2025-03-15T10:00:00'))
    expect(start.getFullYear()).toBe(2025)
    expect(start.getMonth()).toBe(2) // March
    expect(start.getDate()).toBe(1)
    expect(end.getMonth()).toBe(2)
    expect(end.getDate()).toBe(31)
  })

  it('2月の月末を正しく返す', () => {
    const { end } = getMonthRange(new Date('2025-02-10T10:00:00'))
    expect(end.getDate()).toBe(28)
  })
})

describe('filterActivitiesByMonth', () => {
  const activities = [
    { startedAt: '2025-03-01T10:00:00' },
    { startedAt: '2025-03-15T12:00:00' },
    { startedAt: '2025-02-28T10:00:00' },
    { startedAt: '2025-04-01T10:00:00' },
  ]

  it('指定月のアクティビティのみ返す', () => {
    const result = filterActivitiesByMonth(activities, new Date('2025-03-10'))
    expect(result).toHaveLength(2)
    expect(result[0].startedAt).toBe('2025-03-01T10:00:00')
    expect(result[1].startedAt).toBe('2025-03-15T12:00:00')
  })

  it('該当なしなら空配列を返す', () => {
    const result = filterActivitiesByMonth(activities, new Date('2025-01-10'))
    expect(result).toHaveLength(0)
  })
})

describe('calculateTotalMinutes', () => {
  it('各アクティビティを丸めて合計する', () => {
    const activities = [
      { startedAt: '2025-01-15T10:00:00Z', endedAt: '2025-01-15T10:07:00Z' }, // 7分 → ceil 15 = 15
      { startedAt: '2025-01-15T11:00:00Z', endedAt: '2025-01-15T11:20:00Z' }, // 20分 → ceil 15 = 30
    ]
    expect(calculateTotalMinutes(activities, 15, 'ceil')).toBe(45)
  })

  it('floor で丸める', () => {
    const activities = [
      { startedAt: '2025-01-15T10:00:00Z', endedAt: '2025-01-15T10:07:00Z' }, // 7分 → floor 15 = 0
      { startedAt: '2025-01-15T11:00:00Z', endedAt: '2025-01-15T11:20:00Z' }, // 20分 → floor 15 = 15
    ]
    expect(calculateTotalMinutes(activities, 15, 'floor')).toBe(15)
  })

  it('空配列なら0を返す', () => {
    expect(calculateTotalMinutes([], 15, 'ceil')).toBe(0)
  })
})
