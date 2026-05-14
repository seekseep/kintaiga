export type Period = {
  startedAt: Date
  endedAt: Date | null
}

/**
 * 2 つの期間が重複しているか判定する。
 * endedAt が null は「永続 (∞)」を意味する。
 * 単点 (startedAt === endedAt) や境界一致 (a.endedAt === b.startedAt) も重複とみなす。
 */
export function periodsOverlap(a: Period, b: Period): boolean {
  const aStartsBeforeOrAtBEnds = b.endedAt === null || a.startedAt <= b.endedAt
  const bStartsBeforeOrAtAEnds = a.endedAt === null || b.startedAt <= a.endedAt
  return aStartsBeforeOrAtBEnds && bStartsBeforeOrAtAEnds
}
