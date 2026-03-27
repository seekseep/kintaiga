import { describe, it, expect } from 'vitest'
import { validateActivityDates, isValidDateString } from '.'

describe('validateActivityDates', () => {
  it('endedAt が startedAt より後なら valid', () => {
    const result = validateActivityDates(
      new Date('2025-01-15T10:00:00'),
      new Date('2025-01-15T11:00:00'),
    )
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('endedAt が startedAt と同じなら invalid', () => {
    const result = validateActivityDates(
      new Date('2025-01-15T10:00:00'),
      new Date('2025-01-15T10:00:00'),
    )
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('endedAt が startedAt より前なら invalid', () => {
    const result = validateActivityDates(
      new Date('2025-01-15T11:00:00'),
      new Date('2025-01-15T10:00:00'),
    )
    expect(result.valid).toBe(false)
  })

  it('endedAt が null なら valid（進行中）', () => {
    const result = validateActivityDates(
      new Date('2025-01-15T10:00:00'),
      null,
    )
    expect(result.valid).toBe(true)
  })
})

describe('isValidDateString', () => {
  it('有効な日付文字列', () => {
    expect(isValidDateString('2025-01-15T10:00:00')).toBe(true)
    expect(isValidDateString('2025-01-15')).toBe(true)
  })

  it('無効な日付文字列', () => {
    expect(isValidDateString('not-a-date')).toBe(false)
    expect(isValidDateString('')).toBe(false)
  })
})
