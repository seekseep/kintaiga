'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { OrganizationRoleGuard } from '@/components/layouts/organization-role-guard'
import { useOrganization } from '@/contexts/organization-context'
import { useOrganizationPath } from '@/hooks/use-organization-path'
import { importOrganizationData } from '@/api/organization/data-transfer'
import { OrganizationExportPayloadSchema, type OrganizationExportPayload } from '@/services/organization/exportOrganization/schema'
import type { ImportOrganizationResult } from '@/services/organization/importOrganization'

export default function ImportOrganizationPage() {
  const router = useRouter()
  const { name: organizationName } = useOrganization()
  const orgPath = useOrganizationPath()
  const [payload, setPayload] = useState<OrganizationExportPayload | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [overwriteConfiguration, setOverwriteConfiguration] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [result, setResult] = useState<ImportOrganizationResult | null>(null)

  const handleFile = async (file: File) => {
    setFileError(null)
    setPayload(null)
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const parsed = OrganizationExportPayloadSchema.safeParse(json)
      if (!parsed.success) {
        setFileError('ファイル形式が正しくありません')
        return
      }
      setPayload(parsed.data)
    } catch {
      setFileError('JSON の読み込みに失敗しました')
    }
  }

  const handleSubmit = async () => {
    if (!payload) return
    setIsImporting(true)
    try {
      const res = await importOrganizationData(organizationName, { payload, overwriteConfiguration })
      setResult(res)
      toast.success('インポートが完了しました')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'インポートに失敗しました'
      toast.error(message)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <OrganizationRoleGuard allowedRoles={['owner', 'manager']}>
      <div className="mx-auto max-w-lg space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link href={`${orgPath}/configuration`}>設定</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>データのインポート</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {result ? (
          <Card>
            <CardHeader>
              <CardTitle>インポートが完了しました</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1 text-sm">
                <p>プロジェクト: {result.stats.projects} 件</p>
                <p>アサインメント: {result.stats.assignments} 件</p>
                <p>稼働: {result.stats.activities} 件</p>
              </div>
              {(result.skipped.missingMembers.length > 0 || result.skipped.assignments > 0 || result.skipped.activities > 0 || result.skipped.projects.length > 0) && (
                <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm space-y-2">
                  <p className="font-medium text-yellow-900">スキップされたデータ</p>
                  {result.skipped.missingMembers.length > 0 && (
                    <div>
                      <p className="text-yellow-900">この組織に存在しないメンバーが参照されています。先にメンバーを追加して再実行してください:</p>
                      <ul className="list-disc list-inside text-yellow-900">
                        {result.skipped.missingMembers.map((email) => (
                          <li key={email}>{email}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.skipped.projects.length > 0 && (
                    <div>
                      <p className="text-yellow-900">スキップされたプロジェクト:</p>
                      <ul className="list-disc list-inside text-yellow-900">
                        {result.skipped.projects.map((p) => (
                          <li key={p.name}>{p.name}（{p.reason}）</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.skipped.assignments > 0 && (
                    <p className="text-yellow-900">アサインメント: {result.skipped.assignments} 件</p>
                  )}
                  {result.skipped.activities > 0 && (
                    <p className="text-yellow-900">稼働: {result.skipped.activities} 件</p>
                  )}
                </div>
              )}
              <Button className="w-full" onClick={() => router.push(`${orgPath}/projects`)}>
                プロジェクト一覧へ
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>データのインポート</CardTitle>
              <CardDescription>
                エクスポート JSON からプロジェクト・アサインメント・稼働をこの組織に取り込みます。
                メンバーはメールアドレスで突合します。先に対象メンバーを組織に追加しておいてください。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">エクスポート JSON ファイル</Label>
                <Input
                  id="file"
                  type="file"
                  accept="application/json,.json"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(file)
                  }}
                />
                {fileError && <p className="text-sm text-destructive">{fileError}</p>}
                {payload && (
                  <p className="text-sm text-muted-foreground">
                    {payload.source.organizationName} / メンバー {payload.members.length} 件 / プロジェクト {payload.projects.length} 件
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="overwriteConfiguration"
                  checked={overwriteConfiguration}
                  onCheckedChange={(v) => setOverwriteConfiguration(v === true)}
                />
                <Label htmlFor="overwriteConfiguration" className="text-sm font-normal">
                  稼働の設定（丸め・集計）も上書きする
                </Label>
              </div>
              <Button
                className="w-full"
                disabled={!payload || isImporting}
                onClick={handleSubmit}
              >
                {isImporting ? 'インポート中...' : 'インポートを実行'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </OrganizationRoleGuard>
  )
}
