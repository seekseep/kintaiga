'use client'

import { useRouter } from 'next/navigation'
import { Formik } from 'formik'
import { supabase } from '@/lib/supabase'
import { UpdateUserPasswordParametersSchema } from '@/services/user/updateUserPassword'
import { zodValidate } from '@/lib/form/zod-adapter'
import { getAuthErrorMessage } from '@/lib/supabase-auth-errors'
import { toast } from 'sonner'
import Link from 'next/link'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function EditPasswordPage() {
  const router = useRouter()

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/me">マイページ</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>パスワード変更</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle>パスワードの変更</CardTitle>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{ currentPassword: '', newPassword: '' }}
            validate={zodValidate(UpdateUserPasswordParametersSchema)}
            onSubmit={async (values, { setSubmitting, setStatus }) => {
              setStatus(null)

              // 現在のパスワードを検証するためにサインインを試行
              const { data: { session } } = await supabase.auth.getSession()
              if (!session?.user.email) {
                setStatus('セッションが無効です')
                setSubmitting(false)
                return
              }

              const { error: signInError } = await supabase.auth.signInWithPassword({
                email: session.user.email,
                password: values.currentPassword,
              })

              if (signInError) {
                setStatus('現在のパスワードが正しくありません')
                setSubmitting(false)
                return
              }

              const { error } = await supabase.auth.updateUser({ password: values.newPassword })
              setSubmitting(false)
              if (error) {
                setStatus(getAuthErrorMessage(error))
                toast.error('変更に失敗しました')
              } else {
                toast.success('パスワードを変更しました')
                router.push('/me')
              }
            }}
          >
            {({ handleSubmit, isSubmitting, status }) => (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
                <FormInput name="currentPassword" label="現在のパスワード" type="password" />
                <FormInput name="newPassword" label="新しいパスワード" type="password" />
                {status && <p className="text-sm text-destructive">{status}</p>}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? '変更中...' : 'パスワードを変更'}
                </Button>
              </form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  )
}
