'use client'

import Link from 'next/link'
import { toast } from 'sonner'
import { CopyIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

function CodeBlock({ code }: { code: string }) {
  function handleCopy() {
    navigator.clipboard.writeText(code)
    toast.success('コピーしました')
  }
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-2 h-7 w-7"
        onClick={handleCopy}
      >
        <CopyIcon className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

function ToolCategory({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{title}</p>
      <ul className="space-y-1.5">{children}</ul>
    </div>
  )
}

function ToolItem({ name, description, managerOnly }: { name: string; description: string; managerOnly?: boolean }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{name}</code>
      <span className="text-muted-foreground">{description}</span>
      {managerOnly && <Badge variant="outline" className="text-[10px] px-1.5 py-0">manager+</Badge>}
    </li>
  )
}

export default function McpPage() {
  const httpUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/mcp`
    : 'https://<your-domain>/api/mcp'

  const claudeHttpConfig = JSON.stringify(
    {
      mcpServers: {
        kintaiga: {
          type: 'http',
          url: httpUrl,
          headers: {
            Authorization: 'Bearer kga_xxxxxxxxxxxx',
          },
        },
      },
    },
    null,
    2,
  )

  const claudeStdioConfig = JSON.stringify(
    {
      mcpServers: {
        kintaiga: {
          command: 'npx',
          args: ['-y', 'tsx', 'src/mcp/standalone.ts'],
          env: {
            MCP_TOKEN: 'kga_xxxxxxxxxxxx',
          },
        },
      },
    },
    null,
    2,
  )

  const claudeCodeAddCommand = `claude mcp add --transport http kintaiga ${httpUrl} \\
  --header "Authorization: Bearer kga_xxxxxxxxxxxx"`

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/me">マイページ</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/me/tokens">アクセストークン</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>MCPサーバー設定</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>MCPサーバーとして利用する</CardTitle>
          <CardDescription>
            Kintaiga は Model Context Protocol (MCP) サーバーとして動作します。
            Claude Desktop や Claude Code などの MCP クライアントから接続することで、
            アクティビティの登録や明細の参照などを AI から実行できます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            接続には <Link href="/me/tokens" className="underline">アクセストークン</Link> が必要です。
            まだ発行していない場合は、トークン一覧ページから発行してください。
          </p>
          <p className="text-muted-foreground">
            設定例の <code className="rounded bg-muted px-1 py-0.5 text-xs">kga_xxxxxxxxxxxx</code> の部分を、
            発行したトークンに置き換えてください。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>接続方法</CardTitle>
          <CardDescription>HTTP（推奨）または stdio で接続できます。</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="http">
            <TabsList>
              <TabsTrigger value="http">HTTP</TabsTrigger>
              <TabsTrigger value="stdio">stdio</TabsTrigger>
            </TabsList>

            <TabsContent value="http" className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">エンドポイント URL</p>
                <CodeBlock code={httpUrl} />
                <p className="text-xs text-muted-foreground">
                  認証はリクエストヘッダー <code className="rounded bg-muted px-1 py-0.5">Authorization: Bearer &lt;token&gt;</code> で行います。
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Claude Desktop の設定</p>
                <p className="text-xs text-muted-foreground">
                  <code className="rounded bg-muted px-1 py-0.5">claude_desktop_config.json</code> に以下を追記してください。
                </p>
                <CodeBlock code={claudeHttpConfig} />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Claude Code の設定</p>
                <p className="text-xs text-muted-foreground">
                  ターミナルで以下のコマンドを実行してください。
                </p>
                <CodeBlock code={claudeCodeAddCommand} />
              </div>
            </TabsContent>

            <TabsContent value="stdio" className="space-y-4">
              <p className="text-sm">
                ローカルでソースコードからサーバーを起動して接続する方法です。
                Kintaiga リポジトリをクローンしてある必要があります。
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Claude Desktop の設定</p>
                <p className="text-xs text-muted-foreground">
                  <code className="rounded bg-muted px-1 py-0.5">claude_desktop_config.json</code> に以下を追記してください。
                  <br />
                  <code className="rounded bg-muted px-1 py-0.5">cwd</code> として Kintaiga リポジトリのパスを指定する必要があります。
                </p>
                <CodeBlock code={claudeStdioConfig} />
              </div>
              <p className="text-xs text-muted-foreground">
                stdio モードでは <code className="rounded bg-muted px-1 py-0.5">MCP_TOKEN</code> 環境変数からトークンを読み込みます。
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>提供されるツール</CardTitle>
          <CardDescription>MCP クライアントから呼び出せる操作の一覧です。マネージャー以上のみ利用可能なツールがあります。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <ToolCategory title="自分の情報">
            <ToolItem name="get_my_info" description="ユーザーと組織の情報・ロールを取得" />
          </ToolCategory>

          <ToolCategory title="アクティビティ">
            <ToolItem name="list_activities" description="作業記録の一覧取得" />
            <ToolItem name="create_activity" description="作業記録の作成" />
            <ToolItem name="get_activity" description="作業記録の詳細取得" />
            <ToolItem name="update_activity" description="作業記録の更新" />
            <ToolItem name="delete_activity" description="作業記録の削除" />
          </ToolCategory>

          <ToolCategory title="プロジェクト">
            <ToolItem name="list_projects" description="プロジェクト一覧の取得" />
            <ToolItem name="get_project" description="プロジェクトの詳細取得" />
            <ToolItem name="create_project" description="プロジェクトの作成" managerOnly />
            <ToolItem name="update_project" description="プロジェクトの更新" managerOnly />
            <ToolItem name="delete_project" description="プロジェクトの削除" managerOnly />
          </ToolCategory>

          <ToolCategory title="組織メンバー">
            <ToolItem name="list_members" description="メンバー一覧の取得" />
            <ToolItem name="get_member" description="メンバーの詳細取得" />
            <ToolItem name="add_member" description="メンバーの追加" managerOnly />
            <ToolItem name="remove_member" description="メンバーの削除" managerOnly />
          </ToolCategory>

          <ToolCategory title="プロジェクトメンバー">
            <ToolItem name="list_project_members" description="プロジェクトメンバー一覧の取得" />
            <ToolItem name="get_project_member" description="アサイン情報の取得" />
            <ToolItem name="add_project_member" description="プロジェクトへのメンバー追加" managerOnly />
            <ToolItem name="update_project_member" description="アサイン情報の更新" managerOnly />
            <ToolItem name="remove_project_member" description="プロジェクトからのメンバー削除" managerOnly />
          </ToolCategory>

          <ToolCategory title="設定">
            <ToolItem name="get_organization_configuration" description="組織設定の取得" />
            <ToolItem name="update_organization_configuration" description="組織設定の更新" managerOnly />
            <ToolItem name="get_project_configuration" description="プロジェクト設定の取得" />
            <ToolItem name="update_project_configuration" description="プロジェクト設定の更新" managerOnly />
          </ToolCategory>

          <p className="text-xs text-muted-foreground">
            アクセストークンに紐づくメンバーの権限の範囲内で操作が可能です。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
