import { describe, it, expect } from 'vitest'
import { canAddMember } from '.'

describe('canAddMember', () => {
  describe('free プラン', () => {
    it('0人のとき追加可能', () => {
      expect(canAddMember('free', 0)).toBe(true)
    })

    it('1人のとき追加可能', () => {
      expect(canAddMember('free', 1)).toBe(true)
    })

    it('2人のとき追加可能', () => {
      expect(canAddMember('free', 2)).toBe(true)
    })

    it('3人のとき追加不可', () => {
      expect(canAddMember('free', 3)).toBe(false)
    })

    it('4人以上のとき追加不可', () => {
      expect(canAddMember('free', 10)).toBe(false)
    })
  })

  describe('premium プラン', () => {
    it('0人のとき追加可能', () => {
      expect(canAddMember('premium', 0)).toBe(true)
    })

    it('3人のとき追加可能', () => {
      expect(canAddMember('premium', 3)).toBe(true)
    })

    it('100人のとき追加可能', () => {
      expect(canAddMember('premium', 100)).toBe(true)
    })
  })
})
