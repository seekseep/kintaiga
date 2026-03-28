import type { Plan } from '@/schemas/_helpers'

const FREE_MEMBER_LIMIT = 3

/**
 * 組織にメンバーを追加できるか判定する
 * free: 3人まで、premium: 無制限
 */
export function canAddMember(plan: Plan, currentMemberCount: number): boolean {
  if (plan === 'premium') return true
  return currentMemberCount < FREE_MEMBER_LIMIT
}
