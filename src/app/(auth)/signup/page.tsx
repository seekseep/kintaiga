'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Formik } from 'formik'
import { supabase } from '@/lib/supabase'
import { zodValidate } from '@/lib/form/zod-adapter'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form'
import { z } from 'zod/v4'

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export default function SignupPage() {
  const [sent, setSent] = useState(false)

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <p>確認メールを送信しました。</p>
        <p className="text-sm text-muted-foreground">メール内のリンクをクリックして登録を完了してください。</p>
        <Link href="/login" className="text-sm hover:underline">ログインへ戻る</Link>
      </div>
    )
  }

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validate={zodValidate(SignupSchema)}
      onSubmit={async (values, { setStatus }) => {
        setStatus(undefined)
        const { error } = await supabase.auth.signUp({
          ...values,
          options: { emailRedirectTo: window.location.origin },
        })
        if (error) {
          setStatus(error.message)
        } else {
          setSent(true)
        }
      }}
    >
      {({ handleSubmit, isSubmitting, status }) => (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
          <FormInput name="email" label="メールアドレス" type="email" />
          <FormInput name="password" label="パスワード" type="password" />
          {status && <p className="text-sm text-destructive">{status}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? '登録中...' : 'アカウント作成'}
          </Button>
          <div className="text-center text-sm">
            <Link href="/login" className="text-muted-foreground hover:underline">ログインへ戻る</Link>
          </div>
        </form>
      )}
    </Formik>
  )
}
