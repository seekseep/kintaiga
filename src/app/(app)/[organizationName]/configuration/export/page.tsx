'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useOrganization } from '@/contexts/organization-context'
import { useOrganizationPath } from '@/hooks/use-organization-path'
import { exportOrganizationData } from '@/api/organization/data-transfer'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrganizationRoleGuard } from '@/components/layouts/organization-role-guard'

export default function ExportOrganizationPage() {
  const { name: organizationName } = useOrganization()
  const orgPath = useOrganizationPath()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const payload = await exportOrganizationData(organizationName)
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const date = new Date().toISOString().slice(0, 10)
      a.href = url
      a.download = `${organizationName}-${date}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('エクスポートしました')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'エクスポートに失敗しました'
      toast.error(message)
    } finally {
      setIsExporting(false)
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
              <BreadcrumbPage>データのエクスポート</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Card>
          <CardHeader>
            <CardTitle>データのエクスポート</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>組織の構成・メンバー（メール参照）・プロジェクト・稼働データを単一の JSON ファイルとしてダウンロードします。</p>
              <p>このファイルはインポート画面から別環境への移行に利用できます。</p>
              <p className="text-xs">※ メールアドレスが未登録のメンバーに紐づくデータはエクスポートに含まれません。</p>
            </div>
            <Button className="w-full" onClick={handleExport} disabled={isExporting}>
              {isExporting ? 'エクスポート中...' : 'JSON をダウンロード'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </OrganizationRoleGuard>
  )
}
