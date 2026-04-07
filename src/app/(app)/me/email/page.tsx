'use client'

import { useRouter } from 'next/navigation'
import { Formik } from 'formik'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { UpdateUserEmailParametersSchema } from '@/services/user/updateUserEmail'
import { zodValidate } from '@/lib/form/zod-adapter'
import { getAuthErrorMessage } from '@/lib/supabase-auth-errors'
import { toast } from 'sonner'
import Link from 'next/link'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function EditEmailPage() {
  const router = useRouter()
  const { user, session } = useAuth()
  const currentEmail = user?.email ?? session?.user.email ?? null

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/me">マイページ</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>メールアドレス変更</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle>メールアドレスの変更</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">現在のメールアドレス</p>
            <p className="text-sm">{currentEmail ?? '未設定'}</p>
          </div>
          <Formik
            initialValues={{ email: '' }}
            validate={zodValidate(UpdateUserEmailParametersSchema)}
            onSubmit={async (values, { setSubmitting, setStatus }) => {
              setStatus(null)
              const { error } = await supabase.auth.updateUser({ email: values.email })
              setSubmitting(false)
              if (error) {
                setStatus(getAuthErrorMessage(error))
                toast.error('変更に失敗しました')
              } else {
                toast.success('確認メールを送信しました。新しいメールアドレスで確認してください。')
                router.push('/me')
              }
            }}
          >
            {({ handleSubmit, isSubmitting, status }) => (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
                <FormInput name="email" label="新しいメールアドレス" type="email" />
                {status && <p className="text-sm text-destructive">{status}</p>}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? '送信中...' : '確認メールを送信'}
                </Button>
              </form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  )
}
