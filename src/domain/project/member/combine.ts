import type { ProjectMember } from '@/schemas'

/**
 * 同じ userId の複数 assignment を 1 つにまとめる。
 * - startedAt: 最早の startedAt
 * - endedAt: ひとつでも null があれば null (永続)、すべて値があれば最遅
 * - targetMinutes: いずれかに値があれば合算、すべて null なら null
 * - active: いずれかが active なら true
 * - projectAssignmentId は代表値 (startedAt が最早のもの)
 */
export function combineProjectMembers(members: ProjectMember[]): ProjectMember[] {
  const grouped = new Map<string, ProjectMember[]>()
  for (const m of members) {
    const list = grouped.get(m.userId) ?? []
    list.push(m)
    grouped.set(m.userId, list)
  }

  return Array.from(grouped.values()).map((list) => {
    if (list.length === 1) return list[0]

    const sorted = [...list].sort((a, b) => a.startedAt.localeCompare(b.startedAt))
    const earliest = sorted[0]

    const allEndedValues = sorted.map((m) => m.endedAt)
    const endedAt = allEndedValues.some((v) => v === null)
      ? null
      : (allEndedValues as string[]).reduce((acc, v) => (v > acc ? v : acc))

    const targetValues = sorted.map((m) => m.targetMinutes)
    const targetMinutes = targetValues.every((v) => v === null)
      ? null
      : targetValues.reduce<number>((sum, v) => sum + (v ?? 0), 0)

    return {
      ...earliest,
      startedAt: earliest.startedAt,
      endedAt,
      targetMinutes,
      active: sorted.some((m) => m.active),
    }
  })
}
