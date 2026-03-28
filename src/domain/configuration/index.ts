import type { RoundingDirection } from '@/schemas/rounding-direction'
import type { AggregationUnit } from '@/schemas/aggregation-unit'

export const ROUNDING_INTERVALS = [1, 5, 10, 15, 20, 30, 60] as const
export type RoundingInterval = (typeof ROUNDING_INTERVALS)[number]

export type ProjectConfig = {
  roundingInterval: number
  roundingDirection: RoundingDirection
  aggregationUnit: AggregationUnit
  aggregationPeriod: number
}

type GlobalConfig = {
  roundingInterval: number
  roundingDirection: RoundingDirection
  aggregationUnit: AggregationUnit
  aggregationPeriod: number
}

type ProjectOverrides = {
  roundingInterval: number | null
  roundingDirection: RoundingDirection | null
  aggregationUnit: AggregationUnit | null
  aggregationPeriod: number | null
}

/**
 * プロジェクト固有設定をグローバル設定にフォールバックして解決する
 */
export function resolveProjectConfig(global: GlobalConfig, project: ProjectOverrides): ProjectConfig {
  return {
    roundingInterval: project.roundingInterval ?? global.roundingInterval,
    roundingDirection: project.roundingDirection ?? global.roundingDirection,
    aggregationUnit: project.aggregationUnit ?? global.aggregationUnit,
    aggregationPeriod: project.aggregationPeriod ?? global.aggregationPeriod,
  }
}
