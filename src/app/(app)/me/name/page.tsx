'use client'

import { useRouter } from 'next/navigation'
import { Formik } from 'formik'
import { useAuth } from '@/hooks/use-auth'
import { useUpdateMe } from '@/hooks/api/me'
import { UpdateProfileParametersSchema } from '@/services/me/updateProfile'
import { zodValidate } from '@/lib/form/zod-adapter'
import { toast } from 'sonner'
import Link from 'next/link'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function EditNamePage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()

  const mutation = useUpdateMe()

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/me">マイページ</Link></BreadcrumbLink>
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
            initialValues={{ name: user?.name ?? '' }}
            validate={zodValidate(UpdateProfileParametersSchema)}
            onSubmit={(values) => mutation.mutate(values, {
              onSuccess: async () => {
                await refreshUser()
                toast.success('名前を変更しました')
                router.push('/me')
              },
              onError: () => toast.error('変更に失敗しました'),
            })}
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
