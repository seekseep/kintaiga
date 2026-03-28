'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateOrganization } from '@/hooks/api/organizations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { toast } from 'sonner'

const NAME_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/
import { isReservedOrganizationName } from '@/domain/organization-name'

export default function NewOrganizationPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState('')

  const { mutate, isPending } = useCreateOrganization({
    onSuccess: (org) => {
      toast.success('組織を作成しました')
      router.push(`/${org.name}/projects`)
    },
    onError: (error: Error) => {
      toast.error(error.message || '組織の作成に失敗しました')
    },
  })

  const isValidName = name.length >= 2 && name.length <= 63 && NAME_PATTERN.test(name) && !isReservedOrganizationName(name)
  const isValidDisplayName = displayName.length >= 1 && displayName.length <= 255

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>組織を作成</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>組織を作成</CardTitle>
          <CardDescription>
            表示名は画面上に表示される名前です。組織IDはURLに使用されます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (isValidName && isValidDisplayName) mutate({ name, displayName })
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="displayName">表示名</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="テストの組織"
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">組織ID</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase())}
                placeholder="my-organization"
                minLength={2}
                maxLength={63}
              />
              {name && !isValidName && (
                <p className="text-sm text-destructive">
                  {name.length < 2 ? '2文字以上で入力してください' :
                   isReservedOrganizationName(name) ? 'この名前は予約されています' :
                   '英小文字、数字、ハイフンのみ使用できます'}
                </p>
              )}
              {isValidName && (
                <p className="text-sm text-muted-foreground">
                  URL: /{name}/projects
                </p>
              )}
            </div>
            <Button type="submit" disabled={!isValidName || !isValidDisplayName || isPending} className="w-full">
              {isPending ? '作成中...' : '組織を作成'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
