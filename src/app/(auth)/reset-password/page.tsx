'use client'

import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import type { AuthError } from '@supabase/supabase-js'
import { Formik } from 'formik'
import { supabase } from '@/lib/supabase'
import { zodValidate } from '@/lib/form/zod-adapter'
import { getAuthErrorMessage } from '@/lib/supabase-auth-errors'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form'
import { z } from 'zod/v4'

const ResetPasswordSchema = z.object({
  email: z.email(),
})

type ResetPasswordValues = z.infer<typeof ResetPasswordSchema>

export default function ResetPasswordPage() {
  const mutation = useMutation<void, AuthError, ResetPasswordValues>({
    mutationFn: async (values) => {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/me/password`,
      })
      if (error) throw error
    },
  })

  if (mutation.isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <p>パスワードリセットメールを送信しました。</p>
        <Link href="/login" className="text-sm hover:underline">ログインへ戻る</Link>
      </div>
    )
  }

  return (
    <Formik
      initialValues={{ email: '' }}
      validate={zodValidate(ResetPasswordSchema)}
      onSubmit={(values) => mutation.mutate(values)}
    >
      {({ handleSubmit }) => (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
          <FormInput name="email" label="メールアドレス" type="email" />
          {mutation.error && <p className="text-sm text-destructive">{getAuthErrorMessage(mutation.error)}</p>}
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? '送信中...' : 'リセットメールを送信'}
          </Button>
          <div className="text-center text-sm">
            <Link href="/login" className="text-muted-foreground hover:underline">ログインへ戻る</Link>
          </div>
        </form>
      )}
    </Formik>
  )
}
