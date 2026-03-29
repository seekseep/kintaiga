'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useProject, useDeleteProject } from '@/hooks/api/projects'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OrganizationRoleGuard } from '@/components/layouts/organization-role-guard'
import { Skeleton } from '@/components/ui/skeleton'

export default function DeleteProjectPage() {
  const { id, organizationName } = useParams<{ id: string; organizationName: string }>()
  const router = useRouter()
  const { data: project, isLoading } = useProject(id)
  const mutation = useDeleteProject()
  const [confirmation, setConfirmation] = useState('')

  const settingsPath = `/${organizationName}/projects/${id}/settings`
  const isConfirmed = confirmation === project?.name

  const handleDelete = () => {
    mutation.mutate({ id }, {
      onSuccess: () => {
        toast.success('プロジェクトを削除しました')
        router.push(`/${organizationName}/projects`)
      },
      onError: () => {
        toast.error('削除に失敗しました')
      },
    })
  }

  if (isLoading) return (
    <div className="mx-auto max-w-lg space-y-4">
      <Skeleton className="h-5 w-48" />
      <div className="rounded-xl ring-1 ring-foreground/10 bg-card py-4">
        <div className="px-6 pb-4"><Skeleton className="h-6 w-40" /></div>
        <div className="px-6 space-y-4">
          <Skeleton className="h-20 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </div>
  )

  return (
    <OrganizationRoleGuard allowedRoles={['owner', 'manager']}>
      <div className="mx-auto max-w-lg space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>プロジェクトの削除</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4 space-y-2">
              <p className="text-sm font-medium text-destructive">この操作は取り消せません</p>
              <p className="text-sm text-muted-foreground">
                プロジェクトを削除すると、すべての稼働データ、メンバー情報が完全に削除されます。
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmation">
                確認のためプロジェクト名「{project?.name}」を入力してください
              </Label>
              <Input
                id="confirmation"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder={project?.name}
              />
            </div>
            <Button
              variant="destructive"
              className="w-full"
              disabled={!isConfirmed || mutation.isPending}
              onClick={handleDelete}
            >
              {mutation.isPending ? '削除中...' : 'プロジェクトを削除'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </OrganizationRoleGuard>
  )
}
