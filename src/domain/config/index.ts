import type { RoundingDirection, AggregationUnit } from '@/schemas/_helpers'

export const ROUNDING_INTERVALS = [1, 5, 10, 15, 20, 30, 60] as const
export type RoundingInterval = (typeof ROUNDING_INTERVALS)[number]

export type ProjectConfig = {
  roundingInterval: number
  roundingDirection: RoundingDirection
  aggregationUnit: AggregationUnit
}

type GlobalConfig = {
  roundingInterval: number
  roundingDirection: RoundingDirection
  aggregationUnit: AggregationUnit
}

type ProjectOverrides = {
  roundingInterval: number | null
  roundingDirection: RoundingDirection | null
  aggregationUnit: AggregationUnit | null
}

/**
 * プロジェクト固有設定をグローバル設定にフォールバックして解決する
 */
export function resolveProjectConfig(global: GlobalConfig, project: ProjectOverrides): ProjectConfig {
  return {
    roundingInterval: project.roundingInterval ?? global.roundingInterval,
    roundingDirection: project.roundingDirection ?? global.roundingDirection,
    aggregationUnit: project.aggregationUnit ?? global.aggregationUnit,
  }
}
