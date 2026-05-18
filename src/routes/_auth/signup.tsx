import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import type { AuthError } from '@supabase/supabase-js'
import { Formik } from 'formik'
import { z } from 'zod/v4'
import { supabase } from '@/lib/supabase'
import { zodValidate } from '@/lib/form/zod-adapter'
import { getAuthErrorMessage } from '@/lib/supabase-auth-errors'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form'

const SignupSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
})

type SignupValues = z.infer<typeof SignupSchema>

export const Route = createFileRoute('/_auth/signup')({
  component: SignupPage,
})

function SignupPage() {
  const mutation = useMutation<string, AuthError, SignupValues>({
    mutationFn: async (values) => {
      const { error } = await supabase.auth.signUp({
        ...values,
        options: { emailRedirectTo: `${window.location.origin}/login` },
      })
      if (error) throw error
      return values.email
    },
  })

  if (mutation.isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <p>確認メールを送信しました。</p>
        <p className="text-sm font-medium">{mutation.data}</p>
        <p className="text-sm text-muted-foreground">メール内のリンクをクリックして登録を完了してください。</p>
        <Link to="/login" className="text-sm hover:underline">ログインへ戻る</Link>
      </div>
    )
  }

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validate={zodValidate(SignupSchema)}
      onSubmit={(values) => mutation.mutate(values)}
    >
      {({ handleSubmit }) => (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
          <FormInput name="email" label="メールアドレス" type="email" />
          <FormInput name="password" label="パスワード" type="password" />
          {mutation.error && <p className="text-sm text-destructive">{getAuthErrorMessage(mutation.error)}</p>}
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? '登録中...' : 'アカウント作成'}
          </Button>
          <div className="text-center text-sm">
            <Link to="/login" className="text-muted-foreground hover:underline">ログインへ戻る</Link>
          </div>
        </form>
      )}
    </Formik>
  )
}
