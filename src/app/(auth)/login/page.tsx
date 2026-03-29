'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Formik } from 'formik'
import { supabase } from '@/lib/supabase'
import { LoginParametersSchema } from '@/services/auth/login'
import { zodValidate } from '@/lib/form/zod-adapter'
import { getAuthErrorMessage, getAuthErrorMessageByCode } from '@/lib/supabase-auth-errors'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const authError = searchParams.get('auth_error')

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validate={zodValidate(LoginParametersSchema)}
      onSubmit={async (values, { setStatus }) => {
        setStatus(undefined)
        const { error } = await supabase.auth.signInWithPassword(values)
        if (error) setStatus(getAuthErrorMessage(error))
      }}
    >
      {({ handleSubmit, isSubmitting, status }) => (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
          {authError && !status && (
            <p className="text-sm text-destructive">{getAuthErrorMessageByCode(authError)}</p>
          )}
          <FormInput name="email" label="メールアドレス" type="email" />
          <FormInput name="password" label="パスワード" type="password" />
          {status && <p className="text-sm text-destructive">{status}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'ログイン中...' : 'ログイン'}
          </Button>
          <div className="flex justify-between text-sm">
            <Link href="/signup" className="text-muted-foreground hover:underline">アカウント作成</Link>
            <Link href="/reset-password" className="text-muted-foreground hover:underline">パスワードを忘れた</Link>
          </div>
        </form>
      )}
    </Formik>
  )
}
