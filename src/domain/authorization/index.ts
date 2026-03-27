import type { Role } from '@/schemas/_helpers'
import type { Executor } from '@/services/types'

/**
 * アクティビティの操作権限（閲覧・編集・削除）を判定する
 * 管理者、または自分のアクティビティのみ操作可能
 */
export function canControlActivity(executor: { role: Role; id: string }, activity: { userId: string }): boolean {
  return executor.role === 'admin' || executor.id === activity.userId
}

/**
 * ユーザー情報の変更権限を判定する
 * 管理者、または自分自身のプロフィールのみ変更可能
 */
export function canModifyUser(role: Role, currentUserId: string, targetUserId: string): boolean {
  return role === 'admin' || currentUserId === targetUserId
}

/**
 * ロール変更権限を判定する（管理者のみ）
 */
export function canChangeRole(role: Role): boolean {
  return role === 'admin'
}

/**
 * 他ユーザーの代理でアクティビティを作成できるか判定する
 * 管理者のみ他ユーザーの代理作成が可能
 */
export function canCreateActivityForUser(role: Role, currentUserId: string, targetUserId: string): boolean {
  return role === 'admin' || currentUserId === targetUserId
}

/**
 * 管理者専用の操作権限を判定する
 */
export function isAdminUser(executor: Executor): boolean {
  return executor.role === 'admin'
}
