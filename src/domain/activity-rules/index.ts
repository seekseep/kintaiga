/**
 * アクティビティの日付バリデーション
 * 終了日時は開始日時より後でなければならない
 */
export function validateActivityDates(
  startedAt: Date,
  endedAt: Date | null,
): { valid: boolean; error?: string } {
  if (endedAt !== null && startedAt >= endedAt) {
    return { valid: false, error: '終了日時は開始日時より後にしてください' }
  }
  return { valid: true }
}

/**
 * 日付文字列が有効かどうかを判定する
 */
export function isValidDateString(value: string): boolean {
  return !isNaN(new Date(value).getTime())
}
