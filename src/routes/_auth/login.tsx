import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import type { AuthError } from '@supabase/supabase-js'
import { Formik } from 'formik'
import { z } from 'zod/v4'
import { supabase } from '@/lib/supabase'
import { LoginParametersSchema, type LoginBody } from '@/services/auth/login'
import { zodValidate } from '@/lib/form/zod-adapter'
import { getAuthErrorMessage, getAuthErrorMessageByCode } from '@/lib/supabase-auth-errors'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form'

const LoginSearchSchema = z.object({
  auth_error: z.string().optional(),
})

export const Route = createFileRoute('/_auth/login')({
  validateSearch: LoginSearchSchema,
  component: LoginPage,
})

function LoginPage() {
  const { auth_error: authError } = Route.useSearch()

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
            <Link to="/signup" className="text-muted-foreground hover:underline">アカウント作成</Link>
            <Link to="/reset-password" className="text-muted-foreground hover:underline">パスワードを忘れた</Link>
          </div>
        </form>
      )}
    </Formik>
  )
}
