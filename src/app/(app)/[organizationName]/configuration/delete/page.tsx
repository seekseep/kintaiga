'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOrganization } from '@/contexts/organization-context'
import { useDeleteOrganization } from '@/hooks/api/organizations'
import { toast } from 'sonner'
import Link from 'next/link'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OrganizationRoleGuard } from '@/components/layouts/organization-role-guard'
import { useOrganizationPath } from '@/hooks/use-organization-path'

export default function DeleteOrganizationPage() {
  const router = useRouter()
  const { name: organizationName } = useOrganization()
  const orgPath = useOrganizationPath()
  const mutation = useDeleteOrganization()
  const [confirmation, setConfirmation] = useState('')

  const isConfirmed = confirmation === organizationName

  const handleDelete = () => {
    mutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('組織を削除しました')
        router.push('/')
      },
      onError: () => {
        toast.error('削除に失敗しました')
      },
    })
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
              <BreadcrumbPage>組織の削除</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Card>
          <CardHeader>
            <CardTitle>組織の削除</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4 space-y-2">
              <p className="text-sm font-medium text-destructive">この操作は取り消せません</p>
              <p className="text-sm text-muted-foreground">
                組織を削除すると、すべてのプロジェクト、稼働データ、メンバー情報が完全に削除されます。
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmation">
                確認のため組織名「{organizationName}」を入力してください
              </Label>
              <Input
                id="confirmation"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder={organizationName}
              />
            </div>
            <Button
              variant="destructive"
              className="w-full"
              disabled={!isConfirmed || mutation.isPending}
              onClick={handleDelete}
            >
              {mutation.isPending ? '削除中...' : '組織を削除'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </OrganizationRoleGuard>
  )
}
