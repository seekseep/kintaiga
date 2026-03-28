'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Formik } from 'formik'
import { useUser, useUpdateUserRole } from '@/hooks/api/users'
import { toast } from 'sonner'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

export default function EditUserRolePage() {
  const { id, organizationName } = useParams<{ id: string; organizationName: string }>()
  const router = useRouter()
  const { data: user, isLoading } = useUser(id)
  const mutation = useUpdateUserRole()

  if (isLoading) return (
    <div className="mx-auto max-w-lg space-y-4">
      <Skeleton className="h-5 w-48" />
      <div className="rounded-xl ring-1 ring-foreground/10 bg-card py-4">
        <div className="px-6 pb-4">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="px-6 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href={`/${organizationName}/users`}>ユーザー</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href={`/${organizationName}/users/${id}`}>{user?.name}</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>ロール編集</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle>ロールの変更</CardTitle>
        </CardHeader>
        <CardContent>
          <Formik
            enableReinitialize
            initialValues={{ role: user?.role ?? 'general' }}
            onSubmit={(values) => mutation.mutate(
              { id, role: values.role as 'admin' | 'general' },
              {
                onSuccess: () => {
                  toast.success('ロールを変更しました')
                  router.push(`/${organizationName}/users/${id}`)
                },
                onError: () => toast.error('変更に失敗しました'),
              }
            )}
          >
            {({ handleSubmit }) => (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
                <FormField name="role" label="ロール">
                  {({ field, helpers }) => (
                    <Select value={field.value} onValueChange={(v) => helpers.setValue(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">一般</SelectItem>
                        <SelectItem value="admin">管理者</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </FormField>
                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? '変更中...' : '変更する'}
                </Button>
              </form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  )
}
