import { describe, it, expect } from 'vitest'
import { NotFoundError } from '@/lib/api-server/errors'
import { getProfile } from './'
import { createGeneralUser } from '../../testing/helpers'

describe('getProfile', () => {
  it('ユーザーが存在する場合はそのまま返す', () => {
    const user = createGeneralUser()
    const result = getProfile({ type: 'user', user })
    expect(result).toBe(user)
  })

  it('executor が null の場合は NotFoundError', () => {
    expect(() => getProfile(null)).toThrow(NotFoundError)
  })
})
