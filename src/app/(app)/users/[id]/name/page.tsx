'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Formik } from 'formik'
import { useUser, useUpdateUser } from '@/hooks/api/users'
import { zodValidate } from '@/lib/form/zod-adapter'
import { toast } from 'sonner'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { z } from 'zod/v4'

const schema = z.object({ name: z.string().min(1) })

export default function EditUserNamePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: user, isLoading } = useUser(id)
  const mutation = useUpdateUser()

  if (isLoading) return <Skeleton className="mx-auto h-64 max-w-lg" />

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/users">ユーザー</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href={`/users/${id}`}>{user?.name}</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>名前編集</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle>名前の変更</CardTitle>
        </CardHeader>
        <CardContent>
          <Formik
            enableReinitialize
            initialValues={{ name: user?.name ?? '' }}
            validate={zodValidate(schema)}
            onSubmit={(values) => mutation.mutate(
              { id, body: values },
              {
                onSuccess: () => {
                  toast.success('名前を変更しました')
                  router.push(`/users/${id}`)
                },
                onError: () => toast.error('変更に失敗しました'),
              }
            )}
          >
            {({ handleSubmit }) => (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
                <FormInput name="name" label="名前" />
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
