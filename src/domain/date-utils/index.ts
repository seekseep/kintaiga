import { format } from 'date-fns'

/**
 * Date をローカルタイムゾーンの datetime-local 文字列 (YYYY-MM-DDTHH:mm) に変換する
 */
export function toLocalDatetimeString(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

/**
 * ISO 文字列をローカルタイムゾーンの datetime-local 文字列に変換する
 */
export function isoToLocalDatetimeString(iso: string): string {
  return toLocalDatetimeString(new Date(iso))
}
