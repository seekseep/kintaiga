'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useProject } from '@/hooks/api/projects'
import { OrganizationRoleGuard } from '@/components/layouts/organization-role-guard'
import { Skeleton } from '@/components/ui/skeleton'
import { TypeIcon, AlignLeftIcon, ClockIcon, Trash2Icon, ChevronRightIcon } from 'lucide-react'

export default function ProjectSettingsPage() {
  const { id, organizationName } = useParams<{ id: string; organizationName: string }>()
  const { data: project, isLoading } = useProject(id)

  const basePath = `/${organizationName}/projects/${id}/settings`

  if (isLoading) return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="divide-y rounded-md border">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-5 w-5" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <OrganizationRoleGuard allowedRoles={['owner', 'manager']}>
      <div className="mx-auto max-w-lg space-y-4">
        <div className="divide-y rounded-md border">
          <Link href={`${basePath}/name`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
            <TypeIcon className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p>プロジェクト名</p>
              <p className="text-sm text-muted-foreground">{project?.name}</p>
            </div>
            <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link href={`${basePath}/description`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
            <AlignLeftIcon className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p>説明</p>
              <p className="text-sm text-muted-foreground">{project?.description || '未設定'}</p>
            </div>
            <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link href={`${basePath}/activities`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
            <ClockIcon className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1">稼働の設定</span>
            <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
          </Link>
        </div>
        <div className="divide-y rounded-md border border-destructive/30">
          <Link href={`${basePath}/delete`} className="flex items-center gap-3 px-4 py-3 hover:bg-destructive/5 transition-colors text-destructive">
            <Trash2Icon className="h-5 w-5" />
            <span className="flex-1">プロジェクトの削除</span>
            <ChevronRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </OrganizationRoleGuard>
  )
}
