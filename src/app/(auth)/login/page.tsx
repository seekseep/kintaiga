'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import type { AuthError } from '@supabase/supabase-js'
import { Formik } from 'formik'
import { supabase } from '@/lib/supabase'
import { LoginParametersSchema, type LoginBody } from '@/services/auth/login'
import { zodValidate } from '@/lib/form/zod-adapter'
import { getAuthErrorMessage, getAuthErrorMessageByCode } from '@/lib/supabase-auth-errors'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const authError = searchParams.get('auth_error')

  const mutation = useMutation<void, AuthError, LoginBody>({
    mutationFn: async (values) => {
      const { error } = await supabase.auth.signInWithPassword(values)
      if (error) throw error
    },
  })

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validate={zodValidate(LoginParametersSchema)}
      onSubmit={(values) => mutation.mutate(values)}
    >
      {({ handleSubmit }) => (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
          {authError && !mutation.error && (
            <p className="text-sm text-destructive">{getAuthErrorMessageByCode(authError)}</p>
          )}
          <FormInput name="email" label="メールアドレス" type="email" />
          <FormInput name="password" label="パスワード" type="password" />
          {mutation.error && <p className="text-sm text-destructive">{getAuthErrorMessage(mutation.error)}</p>}
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'ログイン中...' : 'ログイン'}
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
