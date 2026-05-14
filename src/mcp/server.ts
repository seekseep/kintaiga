import { z } from 'zod/v4'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { db } from '@/lib/api-server/db'
import {
  listOrganizationProjectMemberActivities,
  createOrganizationProjectMemberActivity,
  getOrganizationProjectMemberActivity,
  updateOrganizationProjectMemberActivity,
  deleteOrganizationProjectMemberActivity,
} from '@/services/organization/project/member/activity'
import {
  createOrganizationProject,
  getOrganizationProject,
  updateOrganizationProject,
  deleteOrganizationProject,
} from '@/services/organization/project'
import { listOrganizationProjectStatements } from '@/services/organization/project/statement/listOrganizationProjectStatements'
import {
  listOrganizationMembers,
  getOrganizationMember,
  addOrganizationMember,
  removeOrganizationMember,
} from '@/services/organization/member'
import {
  listOrganizationProjectMembers,
  getOrganizationProjectMember,
  addOrganizationProjectMember,
  updateOrganizationProjectMember,
  removeOrganizationProjectMember,
} from '@/services/organization/project/member'
import { getOrganizationConfiguration } from '@/services/organization/configuration/getOrganizationConfiguration'
import { updateOrganizationConfiguration } from '@/services/organization/configuration/updateOrganizationConfiguration'
import { getOrganizationProjectConfiguration } from '@/services/organization/project/configuration/getOrganizationProjectConfiguration'
import { updateOrganizationProjectConfiguration } from '@/services/organization/project/configuration/updateOrganizationProjectConfiguration'
import { organizations } from '@db/schema'
import { eq } from 'drizzle-orm'
import { HttpError } from '@/lib/api-server/errors'
import type { OrganizationExecutor } from '@/services/types'

export function createMcpServer(executor: OrganizationExecutor) {
  const server = new McpServer({
    name: 'kintaiga',
    version: '1.0.0',
  })

  // --- Tools: 自分の情報 ---

  server.tool(
    'get_my_info',
    '現在のトークンに紐づくユーザーと組織の情報を返します。自分のロール（owner/manager/worker）を確認できます。',
    {},
    async () => {
      const [organization] = await db.select({
        id: organizations.id,
        name: organizations.name,
        plan: organizations.plan,
      }).from(organizations)
        .where(eq(organizations.id, executor.organization.id))
        .limit(1)

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            user: {
              id: executor.user.id,
              role: executor.user.role,
            },
            organization: {
              ...organization,
              role: executor.organization.role,
            },
          }, null, 2),
        }],
      }
    },
  )

  // --- Tools: アクティビティ ---

  server.tool(
    'list_activities',
    'アクティビティ（作業記録）の一覧を取得します。フィルタ条件で絞り込みが可能です。',
    {
      userId: z.string().optional().describe('ユーザーIDでフィルタ（マネージャー以上のみ）'),
      projectId: z.string().optional().describe('プロジェクトIDでフィルタ'),
      ongoing: z.boolean().optional().describe('true: 進行中のアクティビティのみ'),
      startDate: z.string().optional().describe('開始日でフィルタ（ISO8601）'),
      endDate: z.string().optional().describe('終了日でフィルタ（ISO8601）'),
      limit: z.number().optional().describe('取得件数（デフォルト100）'),
      offset: z.number().optional().describe('オフセット（デフォルト0）'),
    },
    async (args) => {
      try {
        const result = await listOrganizationProjectMemberActivities({ db }, executor, args)
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  server.tool(
    'create_activity',
    'アクティビティ（作業記録）を新規作成します。ユーザーはプロジェクトにアサインされている必要があります。',
    {
      projectId: z.string().describe('プロジェクトID（必須）'),
      userId: z.string().optional().describe('対象ユーザーID（マネージャー以上のみ。省略時は自分）'),
      startedAt: z.string().optional().describe('開始日時（ISO8601。省略時は現在時刻）'),
      endedAt: z.string().nullable().optional().describe('終了日時（ISO8601。省略時は進行中）'),
      note: z.string().nullable().optional().describe('メモ'),
    },
    async (args) => {
      try {
        const result = await createOrganizationProjectMemberActivity({ db }, executor, args)
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  server.tool(
    'get_activity',
    'アクティビティ（作業記録）の詳細を取得します。',
    {
      id: z.string().describe('アクティビティID'),
    },
    async (args) => {
      try {
        const result = await getOrganizationProjectMemberActivity({ db }, executor, args)
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  server.tool(
    'update_activity',
    'アクティビティ（作業記録）を更新します。開始・終了日時やメモを変更できます。',
    {
      id: z.string().describe('アクティビティID'),
      startedAt: z.string().optional().describe('開始日時（ISO8601）'),
      endedAt: z.string().nullable().optional().describe('終了日時（ISO8601。nullで進行中に戻す）'),
      note: z.string().nullable().optional().describe('メモ'),
    },
    async (args) => {
      try {
        const result = await updateOrganizationProjectMemberActivity({ db }, executor, args)
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  server.tool(
    'delete_activity',
    'アクティビティ（作業記録）を削除します。',
    {
      id: z.string().describe('アクティビティID'),
    },
    async (args) => {
      try {
        await deleteOrganizationProjectMemberActivity({ db }, executor, args)
        return { content: [{ type: 'text', text: 'アクティビティを削除しました' }] }
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  // --- Tools: プロジェクト ---

  server.tool(
    'list_projects',
    'プロジェクトの一覧を取得します。worker ロールの場合は参加済みプロジェクトのみ表示されます。',
    {
      filter: z.enum(['joined']).optional().describe('joined: 参加中のプロジェクトのみ'),
      limit: z.number().optional().describe('取得件数'),
      offset: z.number().optional().describe('オフセット'),
    },
    async (args) => {
      try {
        const result = await listOrganizationProjectStatements({ db }, executor, args)
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  server.tool(
    'get_project',
    'プロジェクトの詳細を取得します。',
    {
      id: z.string().describe('プロジェクトID'),
    },
    async (args) => {
      try {
        const result = await getOrganizationProject({ db }, executor, args)
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  server.tool(
    'create_project',
    'プロジェクトを新規作成します（マネージャー以上のみ）。',
    {
      name: z.string().describe('プロジェクト名'),
      description: z.string().nullable().optional().describe('プロジェクトの説明'),
    },
    async (args) => {
      try {
        const result = await createOrganizationProject({ db }, executor, args)
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  server.tool(
    'update_project',
    'プロジェクトの情報を更新します（マネージャー以上のみ）。',
    {
      id: z.string().describe('プロジェクトID'),
      name: z.string().optional().describe('プロジェクト名'),
      description: z.string().nullable().optional().describe('プロジェクトの説明'),
    },
    async (args) => {
      try {
        const result = await updateOrganizationProject({ db }, executor, args)
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  server.tool(
    'delete_project',
    'プロジェクトを削除します（マネージャー以上のみ）。この操作は取り消せません。',
    {
      id: z.string().describe('プロジェクトID'),
    },
    async (args) => {
      try {
        const result = await deleteOrganizationProject({ db }, executor, args)
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  // --- Tools: 組織メンバー ---

  server.tool(
    'list_members',
    '組織のメンバー一覧を取得します。',
    {
      limit: z.number().optional().describe('取得件数'),
      offset: z.number().optional().describe('オフセット'),
    },
    async (args) => {
      try {
        const result = await listOrganizationMembers({ db }, executor, args)
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  server.tool(
    'get_member',
    '組織メンバーの詳細を取得します。',
    {
      memberId: z.string().describe('メンバーID'),
    },
    async (args) => {
      try {
        const result = await getOrganizationMember({ db }, executor, args)
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  server.tool(
    'add_member',
    '組織にメンバーを追加します（マネージャー以上のみ）。対象ユーザーは事前にアカウント登録が必要です。',
    {
      email: z.string().describe('追加するユーザーのメールアドレス'),
      role: z.enum(['worker', 'manager']).optional().describe('ロール（デフォルト: worker）'),
    },
    async (args) => {
      try {
        const result = await addOrganizationMember({ db }, executor, args)
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  server.tool(
    'remove_member',
    '組織からメンバーを削除します（マネージャー以上のみ）。この操作は取り消せません。',
    {
      userId: z.string().describe('削除するユーザーのID'),
    },
    async (args) => {
      try {
        const result = await removeOrganizationMember({ db }, executor, args)
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  // --- Tools: プロジェクトメンバー ---

  server.tool(
    'list_project_members',
    'プロジェクトに参加しているメンバーの一覧を取得します。',
    {
      projectId: z.string().optional().describe('プロジェクトIDでフィルタ'),
      userId: z.string().optional().describe('ユーザーIDでフィルタ'),
      active: z.enum(['true', 'false']).optional().describe('true: アクティブなアサインのみ'),
      limit: z.number().optional().describe('取得件数'),
      offset: z.number().optional().describe('オフセット'),
    },
    async (args) => {
      try {
        const result = await listOrganizationProjectMembers({ db }, executor, args)
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  server.tool(
    'get_project_member',
    'プロジェクトメンバーのアサイン情報を取得します。',
    {
      id: z.string().describe('プロジェクトアサインID'),
    },
    async (args) => {
      try {
        const result = await getOrganizationProjectMember({ db }, executor, args)
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  server.tool(
    'add_project_member',
    'プロジェクトにメンバーを追加します（マネージャー以上のみ）。',
    {
      projectId: z.string().describe('プロジェクトID'),
      userId: z.string().describe('ユーザーID'),
      startedAt: z.string().describe('参加開始日時（ISO8601）'),
      endedAt: z.string().nullable().optional().describe('参加終了日時（ISO8601）'),
      targetMinutes: z.number().optional().describe('目標稼働時間（分）'),
    },
    async (args) => {
      try {
        const result = await addOrganizationProjectMember({ db }, executor, args)
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  server.tool(
    'update_project_member',
    'プロジェクトメンバーのアサイン情報を更新します（マネージャー以上のみ）。',
    {
      id: z.string().describe('プロジェクトアサインID'),
      startedAt: z.string().optional().describe('参加開始日時（ISO8601）'),
      endedAt: z.string().nullable().optional().describe('参加終了日時（ISO8601。nullでアクティブに戻す）'),
      targetMinutes: z.number().nullable().optional().describe('目標稼働時間（分。nullでクリア）'),
    },
    async (args) => {
      try {
        const result = await updateOrganizationProjectMember({ db }, executor, args)
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  server.tool(
    'remove_project_member',
    'プロジェクトからメンバーを削除します（マネージャー以上のみ）。この操作は取り消せません。',
    {
      id: z.string().describe('プロジェクトアサインID'),
    },
    async (args) => {
      try {
        const result = await removeOrganizationProjectMember({ db }, executor, args)
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  // --- Tools: 設定 ---

  server.tool(
    'get_organization_configuration',
    '組織の設定（丸め間隔・集計単位など）を取得します。',
    {},
    async () => {
      try {
        const result = await getOrganizationConfiguration({ db }, executor)
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  server.tool(
    'update_organization_configuration',
    '組織の設定を更新します（マネージャー以上のみ）。',
    {
      roundingInterval: z.number().optional().describe('丸め間隔（分）'),
      roundingDirection: z.enum(['ceil', 'floor']).optional().describe('丸め方向（ceil: 切り上げ, floor: 切り捨て）'),
      aggregationUnit: z.enum(['weekly', 'monthly', 'none']).optional().describe('集計単位'),
      aggregationPeriod: z.number().optional().describe('集計期間'),
    },
    async (args) => {
      try {
        const result = await updateOrganizationConfiguration({ db }, executor, args)
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  server.tool(
    'get_project_configuration',
    'プロジェクトの設定を取得します（組織設定とのマージ済み）。',
    {
      id: z.string().describe('プロジェクトID'),
    },
    async (args) => {
      try {
        const result = await getOrganizationProjectConfiguration({ db }, executor, args)
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  server.tool(
    'update_project_configuration',
    'プロジェクトの設定を更新します（マネージャー以上のみ）。nullを指定すると組織設定にフォールバックします。',
    {
      id: z.string().describe('プロジェクトID'),
      roundingInterval: z.number().nullable().optional().describe('丸め間隔（分。nullで組織設定に従う）'),
      roundingDirection: z.enum(['ceil', 'floor']).nullable().optional().describe('丸め方向（nullで組織設定に従う）'),
      aggregationUnit: z.enum(['weekly', 'monthly', 'none']).nullable().optional().describe('集計単位（nullで組織設定に従う）'),
      aggregationPeriod: z.number().nullable().optional().describe('集計期間（nullで組織設定に従う）'),
    },
    async (args) => {
      try {
        const result = await updateOrganizationProjectConfiguration({ db }, executor, args)
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (err) {
        return errorResult(err)
      }
    },
  )

  // --- Resources ---

  server.resource(
    '組織情報',
    'kintaiga://organization/info',
    { description: '現在のトークンに紐づく組織の情報とユーザーの権限', mimeType: 'application/json' },
    async () => {
      const [organization] = await db.select({
        id: organizations.id,
        name: organizations.name,
        plan: organizations.plan,
      }).from(organizations)
        .where(eq(organizations.id, executor.organization.id))
        .limit(1)

      const text = JSON.stringify({
        organization: organization,
        user: {
          id: executor.user.id,
          role: executor.user.role,
          organizationRole: executor.organization.role,
        },
      }, null, 2)

      return { contents: [{ uri: 'kintaiga://organization/info', text, mimeType: 'application/json' }] }
    },
  )

  server.resource(
    'プロジェクト一覧',
    'kintaiga://projects',
    { description: '組織内のプロジェクト一覧（アクティビティ作成時にprojectIdの参照用）', mimeType: 'application/json' },
    async () => {
      const result = await listOrganizationProjectStatements({ db }, executor, {})
      const text = JSON.stringify(result, null, 2)
      return { contents: [{ uri: 'kintaiga://projects', text, mimeType: 'application/json' }] }
    },
  )

  return server
}

function errorResult(err: unknown) {
  const message = err instanceof HttpError ? err.message : 'Internal server error'
  return { content: [{ type: 'text' as const, text: message }], isError: true as const }
}
