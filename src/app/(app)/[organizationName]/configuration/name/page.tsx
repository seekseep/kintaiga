'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useOrganization } from '@/contexts/organization-context'
import { useUpdateOrganization } from '@/hooks/api/organizations'
import { checkOrganizationName } from '@/api/organizations'
import { toast } from 'sonner'
import Link from 'next/link'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OrganizationRoleGuard } from '@/components/layouts/organization-role-guard'
import { useOrganizationPath } from '@/hooks/use-organization-path'
import { Loader2 } from 'lucide-react'

const NAME_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/

export default function EditOrganizationNamePage() {
  const router = useRouter()
  const { name: organizationName } = useOrganization()
  const orgPath = useOrganizationPath()
  const mutation = useUpdateOrganization()

  const [name, setName] = useState(organizationName)
  const [checkResult, setCheckResult] = useState<{ available: boolean; reason: string | null } | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isValidFormat = name.length >= 2 && name.length <= 63 && NAME_PATTERN.test(name)
  const isUnchanged = name === organizationName

  useEffect(() => {
    setCheckResult(null)

    if (!isValidFormat || isUnchanged) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      setIsChecking(true)
      try {
        const result = await checkOrganizationName(name)
        setCheckResult(result)
      } catch {
        setCheckResult(null)
      } finally {
        setIsChecking(false)
      }
    }, 500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [name, isValidFormat, isUnchanged])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidFormat) return
    mutation.mutate({ name }, {
      onSuccess: (data) => {
        toast.success('組織IDを変更しました')
        router.push(`/${data.name}/configuration`)
      },
      onError: () => toast.error('変更に失敗しました'),
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
              <BreadcrumbPage>組織IDの変更</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Card>
          <CardHeader>
            <CardTitle>組織IDの変更</CardTitle>
            <CardDescription>URLに使用されるIDです。英小文字、数字、ハイフンのみ使用できます。</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                {name && !isValidFormat && (
                  <p className="text-sm text-destructive">
                    英小文字、数字、ハイフンのみ（2〜63文字）
                  </p>
                )}
                {isValidFormat && !isUnchanged && (
                  <p className="text-sm text-muted-foreground">
                    URL: /{name}
                  </p>
                )}
                {isChecking && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    確認中...
                  </p>
                )}
                {!isChecking && checkResult && (
                  <p className={`text-sm ${checkResult.available ? 'text-green-600' : 'text-destructive'}`}>
                    {checkResult.available ? 'この組織IDは使用可能です' : checkResult.reason}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={!isValidFormat || isUnchanged || !checkResult?.available || mutation.isPending}>
                {mutation.isPending ? '変更中...' : '変更する'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </OrganizationRoleGuard>
  )
}
