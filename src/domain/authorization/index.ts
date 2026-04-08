import type { OrganizationExecutor } from '@/services/types'

// --- System-level authorization ---

/**
 * アクティビティの操作権限（閲覧・編集・削除）を判定する
 * 管理者、または自分のアクティビティのみ操作可能
 * フロントエンドの User 型 { id, role } でも使われるためシグネチャは { role, id } のまま
 */
export function canControlActivity(executor: { role: string; id: string }, activity: { userId: string }): boolean {
  return executor.role === 'admin' || executor.id === activity.userId
}

/**
 * ユーザー情報の変更権限を判定する
 * 管理者、または自分自身のプロフィールのみ変更可能
 */
export function canModifyUser(executor: { user: { role: string; id: string } }, targetUserId: string): boolean {
  return executor.user.role === 'admin' || executor.user.id === targetUserId
}

/**
 * 権限変更権限を判定する（管理者のみ）
 */
export function canChangeRole(executor: { user: { role: string } }): boolean {
  return executor.user.role === 'admin'
}

/**
 * 他ユーザーの代理でアクティビティを作成できるか判定する
 * 管理者のみ他ユーザーの代理作成が可能
 */
export function canCreateActivityForUser(executor: { user: { role: string; id: string } }, targetUserId: string): boolean {
  return executor.user.role === 'admin' || executor.user.id === targetUserId
}

/**
 * 管理者専用の操作権限を判定する
 */
export function canActAsAdmin(executor: { user: { role: string } }): boolean {
  return executor.user.role === 'admin'
}

// --- Organization-level authorization ---

/**
 * 組織オーナーとして操作できるか判定する
 */
export function canActAsOrganizationOwner(executor: OrganizationExecutor): boolean {
  return executor.user.role === 'admin' || executor.organization.role === 'owner'
}

/**
 * 組織マネージャー以上として操作できるか判定する（owner or manager）
 */
export function canActAsOrganizationManager(executor: OrganizationExecutor): boolean {
  return executor.user.role === 'admin' || executor.organization.role === 'owner' || executor.organization.role === 'manager'
}

/**
 * 組織メンバーの管理権限を判定する（owner or manager）
 */
export function canManageOrganizationMembers(executor: OrganizationExecutor): boolean {
  return canActAsOrganizationManager(executor)
}

/**
 * 組織プロジェクトの管理権限を判定する（owner or manager）
 */
export function canManageOrganizationProjects(executor: OrganizationExecutor): boolean {
  return canActAsOrganizationManager(executor)
}

/**
 * レポート作成権限を判定する（owner/manager + premium）
 */
export function canCreateReport(executor: OrganizationExecutor): boolean {
  return canActAsOrganizationManager(executor) && executor.organization.plan === 'premium'
}

/**
 * オーナー移譲権限を判定する（owner のみ）
 */
export function canTransferOwnership(executor: OrganizationExecutor): boolean {
  return executor.user.role === 'admin' || executor.organization.role === 'owner'
}

/**
 * 組織内でのアクティビティ操作権限を判定する
 * owner/manager は全員分、member は自分のみ
 */
export function canControlActivityInOrganization(executor: OrganizationExecutor, activity: { userId: string }): boolean {
  if (executor.user.role === 'admin') return true
  if (executor.organization.role === 'owner' || executor.organization.role === 'manager') return true
  return executor.user.id === activity.userId
}

/**
 * 組織内で指定メンバーの稼働を閲覧できるかを判定する
 * owner/manager は全員、worker は自分のみ
 */
export function canViewMemberActivitiesInOrganization(executor: OrganizationExecutor, targetUserId: string): boolean {
  if (canActAsOrganizationManager(executor)) return true
  return executor.user.id === targetUserId
}
