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
import { listOrganizationProjectStatements } from '@/services/organization/project/statement/listOrganizationProjectStatements'
import { organizations } from '@db/schema'
import { eq } from 'drizzle-orm'
import { HttpError } from '@/lib/api-server/errors'
import type { OrganizationExecutor } from '@/services/types'

export function createMcpServer(executor: OrganizationExecutor) {
  const server = new McpServer({
    name: 'kintaiga',
    version: '1.0.0',
  })

  // --- Tools ---

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
