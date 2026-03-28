import { differenceInMinutes } from 'date-fns'
import type { RoundingDirection } from '@/schemas/rounding-direction'

/**
 * 分数を指定間隔で丸める
 */
export function roundMinutes(minutes: number, interval: number, direction: RoundingDirection): number {
  if (interval <= 0) return minutes
  return direction === 'ceil'
    ? Math.ceil(minutes / interval) * interval
    : Math.floor(minutes / interval) * interval
}

/**
 * Date を指定分間隔で丸める
 */
export function roundDate(date: Date, intervalMinutes: number, direction: RoundingDirection): Date {
  if (intervalMinutes <= 0) return date
  const ms = intervalMinutes * 60 * 1000
  const rounded = direction === 'ceil'
    ? Math.ceil(date.getTime() / ms) * ms
    : Math.floor(date.getTime() / ms) * ms
  return new Date(rounded)
}

/**
 * 開始・終了日時から経過分数を計算する
 * endedAt が null の場合は現在時刻までの経過分数を返す
 */
export function calcElapsedMinutes(startedAt: string, endedAt: string | null): number {
  const start = new Date(startedAt)
  const end = endedAt ? new Date(endedAt) : new Date()
  return differenceInMinutes(end, start)
}

/**
 * 分数を「X時間Y分」形式にフォーマットする
 */
export function formatHours(minutes: number): string {
  const hours = minutes / 60
  return hours.toFixed(1)
}

export function formatMinutes(minutes: number): string {
  return `${formatHours(minutes)}時間`
}

/**
 * 開始・終了日時から経過時間を「X時間Y分」形式で返す
 */
export function formatElapsed(startedAt: string, endedAt: string | null): string {
  return formatMinutes(calcElapsedMinutes(startedAt, endedAt))
}
