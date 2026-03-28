import { startOfMonth, endOfMonth } from 'date-fns'
import type { RoundingDirection } from '@/schemas/rounding-direction'
import { roundMinutes, calcElapsedMinutes } from '@/domain/time'

/**
 * 指定日の属する月の範囲を返す
 */
export function getMonthRange(now: Date = new Date()): { start: Date; end: Date } {
  return { start: startOfMonth(now), end: endOfMonth(now) }
}

/**
 * アクティビティを指定月でフィルタする
 */
export function filterActivitiesByMonth<T extends { startedAt: string }>(
  activities: T[],
  now: Date = new Date(),
): T[] {
  const { start, end } = getMonthRange(now)
  return activities.filter(a => {
    const d = new Date(a.startedAt)
    return d >= start && d <= end
  })
}

/**
 * アクティビティの合計時間を丸めつきで算出する（分単位）
 */
export function calculateTotalMinutes<T extends { startedAt: string; endedAt: string | null }>(
  activities: T[],
  roundingInterval: number,
  roundingDirection: RoundingDirection,
): number {
  return activities.reduce((sum, a) => {
    const raw = calcElapsedMinutes(a.startedAt, a.endedAt)
    return sum + roundMinutes(raw, roundingInterval, roundingDirection)
  }, 0)
}
