import { createFileRoute, Link } from '@tanstack/react-router'
import { useOrganization } from '@/contexts/organization-context'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { OrganizationRoleGuard } from '@/components/layouts/organization-role-guard'
import { BuildingIcon, ClockIcon, Trash2Icon, ChevronRightIcon, TypeIcon, DownloadIcon, UploadIcon } from 'lucide-react'

export const Route = createFileRoute('/_app/$organizationName/configuration/')({
  component: SettingsPage,
})

function SettingsPage() {
  const { name: organizationName, displayName } = useOrganization()

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
          <Link
            to="/$organizationName/configuration/display-name"
            params={{ organizationName }}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <TypeIcon className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p>表示名</p>
              <p className="text-sm text-muted-foreground">{displayName}</p>
            </div>
            <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link
            to="/$organizationName/configuration/name"
            params={{ organizationName }}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <BuildingIcon className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p>組織ID</p>
              <p className="text-sm text-muted-foreground">{organizationName}</p>
            </div>
            <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link
            to="/$organizationName/configuration/activities"
            params={{ organizationName }}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <ClockIcon className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1">稼働の設定</span>
            <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link
            to="/$organizationName/configuration/export"
            params={{ organizationName }}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <DownloadIcon className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1">データのエクスポート</span>
            <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link
            to="/$organizationName/configuration/import"
            params={{ organizationName }}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <UploadIcon className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1">データのインポート</span>
            <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
          </Link>
        </div>
        <div className="divide-y rounded-md border border-destructive/30">
          <Link
            to="/$organizationName/configuration/delete"
            params={{ organizationName }}
            className="flex items-center gap-3 px-4 py-3 hover:bg-destructive/5 transition-colors text-destructive"
          >
            <Trash2Icon className="h-5 w-5" />
            <span className="flex-1">組織の削除</span>
            <ChevronRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </OrganizationRoleGuard>
  )
}
