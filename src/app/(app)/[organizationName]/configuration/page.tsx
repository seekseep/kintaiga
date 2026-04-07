'use client'

import Link from 'next/link'
import { useOrganization } from '@/contexts/organization-context'
import { useOrganizationPath } from '@/hooks/use-organization-path'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { OrganizationRoleGuard } from '@/components/layouts/organization-role-guard'
import { BuildingIcon, ClockIcon, Trash2Icon, ChevronRightIcon, TypeIcon, DownloadIcon, UploadIcon } from 'lucide-react'

export default function SettingsPage() {
  const { name: organizationName, displayName } = useOrganization()
  const orgPath = useOrganizationPath()

  return (
    <OrganizationRoleGuard allowedRoles={['owner', 'manager']}>
      <div className="mx-auto max-w-lg space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>設定</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="divide-y rounded-md border">
          <Link href={`${orgPath}/configuration/display-name`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
            <TypeIcon className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p>表示名</p>
              <p className="text-sm text-muted-foreground">{displayName}</p>
            </div>
            <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link href={`${orgPath}/configuration/name`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
            <BuildingIcon className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p>組織ID</p>
              <p className="text-sm text-muted-foreground">{organizationName}</p>
            </div>
            <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link href={`${orgPath}/configuration/activities`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
            <ClockIcon className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1">稼働の設定</span>
            <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link href={`${orgPath}/configuration/export`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
            <DownloadIcon className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1">データのエクスポート</span>
            <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link href={`${orgPath}/configuration/import`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
            <UploadIcon className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1">データのインポート</span>
            <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
          </Link>
        </div>
        <div className="divide-y rounded-md border border-destructive/30">
          <Link href={`${orgPath}/configuration/delete`} className="flex items-center gap-3 px-4 py-3 hover:bg-destructive/5 transition-colors text-destructive">
            <Trash2Icon className="h-5 w-5" />
            <span className="flex-1">組織の削除</span>
            <ChevronRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </OrganizationRoleGuard>
  )
}
