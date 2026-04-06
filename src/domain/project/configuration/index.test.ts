import { describe, it, expect } from 'vitest'
import { resolveProjectConfig, ROUNDING_INTERVALS } from '.'

describe('ROUNDING_INTERVALS', () => {
  it('許可された間隔値を含む', () => {
    expect(ROUNDING_INTERVALS).toEqual([1, 5, 10, 15, 20, 30, 60])
  })
})

describe('resolveProjectConfig', () => {
  const globalConfig = {
    roundingInterval: 15,
    roundingDirection: 'ceil' as const,
    aggregationUnit: 'monthly' as const,
    aggregationPeriod: 1,
  }

  it('プロジェクト設定が全て null ならグローバル設定を返す', () => {
    const project = { roundingInterval: null, roundingDirection: null, aggregationUnit: null, aggregationPeriod: null }
    expect(resolveProjectConfig(globalConfig, project)).toEqual(globalConfig)
  })

  it('プロジェクト設定が全て指定されていればそちらを返す', () => {
    const project = {
      roundingInterval: 30,
      roundingDirection: 'floor' as const,
      aggregationUnit: 'none' as const,
      aggregationPeriod: 2,
    }
    expect(resolveProjectConfig(globalConfig, project)).toEqual(project)
  })

  it('部分的にオーバーライドできる', () => {
    const project = { roundingInterval: 5, roundingDirection: null, aggregationUnit: null, aggregationPeriod: null }
    expect(resolveProjectConfig(globalConfig, project)).toEqual({
      roundingInterval: 5,
      roundingDirection: 'ceil',
      aggregationUnit: 'monthly',
      aggregationPeriod: 1,
    })
  })
})
