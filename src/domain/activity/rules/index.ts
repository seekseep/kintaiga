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
