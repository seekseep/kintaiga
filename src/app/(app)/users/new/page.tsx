'use client'

import { useRouter } from 'next/navigation'
import { Formik } from 'formik'
import { useCreateUser } from '@/hooks/api/users'
import { CreateUserParametersSchema } from '@db/validation'
import { zodValidate } from '@/lib/form/zod-adapter'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FormInput, FormSelect } from '@/components/form'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function UserNewPage() {
  const router = useRouter()

  const mutation = useCreateUser()

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/users">ユーザー</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>新規作成</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle>新規ユーザー</CardTitle>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{ email: '', password: '', name: '', role: 'general' as const }}
            validate={zodValidate(CreateUserParametersSchema)}
            onSubmit={(values) => mutation.mutate(values, {
              onSuccess: () => {
                toast.success('ユーザーを作成しました')
                router.push('/users')
              },
              onError: () => toast.error('作成に失敗しました'),
            })}
          >
            {({ handleSubmit }) => (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
                <FormInput name="email" label="メールアドレス" type="email" />
                <FormInput name="password" label="初期パスワード" type="password" />
                <FormInput name="name" label="名前" />
                <FormSelect
                  name="role"
                  label="ロール"
                  options={[
                    { value: 'general', label: '一般' },
                    { value: 'admin', label: '管理者' },
                  ]}
                />
                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? '作成中...' : '作成'}
                </Button>
              </form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  )
}
