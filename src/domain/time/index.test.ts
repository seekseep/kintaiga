import { describe, it, expect } from 'vitest'
import { roundMinutes, roundDate, calcElapsedMinutes, formatMinutes, formatElapsed } from '.'

describe('roundMinutes', () => {
  it('ceil で15分間隔に丸める', () => {
    expect(roundMinutes(7, 15, 'ceil')).toBe(15)
    expect(roundMinutes(16, 15, 'ceil')).toBe(30)
    expect(roundMinutes(15, 15, 'ceil')).toBe(15)
  })

  it('floor で15分間隔に丸める', () => {
    expect(roundMinutes(7, 15, 'floor')).toBe(0)
    expect(roundMinutes(16, 15, 'floor')).toBe(15)
    expect(roundMinutes(15, 15, 'floor')).toBe(15)
  })

  it('interval が 0 以下ならそのまま返す', () => {
    expect(roundMinutes(7, 0, 'ceil')).toBe(7)
    expect(roundMinutes(7, -1, 'ceil')).toBe(7)
  })

  it('0分は丸めても0', () => {
    expect(roundMinutes(0, 15, 'ceil')).toBe(0)
    expect(roundMinutes(0, 15, 'floor')).toBe(0)
  })

  it('異なる間隔 (5, 10, 30, 60) で動作する', () => {
    expect(roundMinutes(3, 5, 'ceil')).toBe(5)
    expect(roundMinutes(3, 5, 'floor')).toBe(0)
    expect(roundMinutes(25, 30, 'ceil')).toBe(30)
    expect(roundMinutes(25, 30, 'floor')).toBe(0)
    expect(roundMinutes(45, 60, 'ceil')).toBe(60)
    expect(roundMinutes(45, 60, 'floor')).toBe(0)
  })
})

describe('roundDate', () => {
  it('ceil で15分間隔に丸める', () => {
    const date = new Date('2025-01-15T10:07:00')
    const result = roundDate(date, 15, 'ceil')
    expect(result.getMinutes()).toBe(15)
    expect(result.getHours()).toBe(10)
  })

  it('floor で15分間隔に丸める', () => {
    const date = new Date('2025-01-15T10:07:00')
    const result = roundDate(date, 15, 'floor')
    expect(result.getMinutes()).toBe(0)
    expect(result.getHours()).toBe(10)
  })

  it('ちょうどの時刻はそのまま', () => {
    const date = new Date('2025-01-15T10:15:00')
    expect(roundDate(date, 15, 'ceil').getTime()).toBe(date.getTime())
    expect(roundDate(date, 15, 'floor').getTime()).toBe(date.getTime())
  })

  it('interval が 0 以下なら元の Date を返す', () => {
    const date = new Date('2025-01-15T10:07:00')
    expect(roundDate(date, 0, 'ceil')).toBe(date)
  })

  it('元の Date を変更しない', () => {
    const date = new Date('2025-01-15T10:07:00')
    const original = date.getTime()
    roundDate(date, 15, 'ceil')
    expect(date.getTime()).toBe(original)
  })
})

describe('calcElapsedMinutes', () => {
  it('開始と終了の差分を分で返す', () => {
    expect(calcElapsedMinutes('2025-01-15T10:00:00Z', '2025-01-15T11:30:00Z')).toBe(90)
  })

  it('0分の場合', () => {
    expect(calcElapsedMinutes('2025-01-15T10:00:00Z', '2025-01-15T10:00:00Z')).toBe(0)
  })

  it('秒は切り捨て', () => {
    expect(calcElapsedMinutes('2025-01-15T10:00:00Z', '2025-01-15T10:00:59Z')).toBe(0)
    expect(calcElapsedMinutes('2025-01-15T10:00:00Z', '2025-01-15T10:01:30Z')).toBe(1)
  })

  it('endedAt が null なら現在時刻までの分数を返す（0以上）', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60000).toISOString()
    const result = calcElapsedMinutes(fiveMinutesAgo, null)
    expect(result).toBeGreaterThanOrEqual(4)
    expect(result).toBeLessThanOrEqual(6)
  })
})

describe('formatMinutes', () => {
  it('0分', () => {
    expect(formatMinutes(0)).toBe('0分')
  })

  it('60分未満', () => {
    expect(formatMinutes(30)).toBe('30分')
  })

  it('60分以上', () => {
    expect(formatMinutes(90)).toBe('1時間30分')
    expect(formatMinutes(120)).toBe('2時間0分')
  })
})

describe('formatElapsed', () => {
  it('開始と終了から経過時間文字列を返す', () => {
    expect(formatElapsed('2025-01-15T10:00:00Z', '2025-01-15T11:30:00Z')).toBe('1時間30分')
  })
})
