import { describe, it, expect } from 'vitest'
import { toLocalDatetimeString, isoToLocalDatetimeString } from '.'

describe('toLocalDatetimeString', () => {
  it('YYYY-MM-DDTHH:mm 形式の文字列を返す', () => {
    const result = toLocalDatetimeString(new Date('2025-01-15T10:30:00'))
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })

  it('秒以下を切り捨てる', () => {
    const result = toLocalDatetimeString(new Date('2025-01-15T10:30:45'))
    expect(result).toMatch(/T\d{2}:\d{2}$/)
    expect(result).not.toContain(':45')
  })
})

describe('isoToLocalDatetimeString', () => {
  it('ISO 文字列を datetime-local 形式に変換する', () => {
    const result = isoToLocalDatetimeString('2025-01-15T10:30:00')
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })

  it('toLocalDatetimeString と同じ結果を返す', () => {
    const iso = '2025-06-15T14:30:00'
    const date = new Date(iso)
    expect(isoToLocalDatetimeString(iso)).toBe(toLocalDatetimeString(date))
  })
})
