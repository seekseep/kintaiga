'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Formik } from 'formik'
import { supabase } from '@/lib/supabase'
import { zodValidate } from '@/lib/form/zod-adapter'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form'
import { z } from 'zod/v4'

const ResetPasswordSchema = z.object({
  email: z.string().email(),
})

export default function ResetPasswordPage() {
  const [sent, setSent] = useState(false)

  if (sent) {
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
      onSubmit={async (values, { setStatus }) => {
        setStatus(undefined)
        const { error } = await supabase.auth.resetPasswordForEmail(values.email)
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
          {status && <p className="text-sm text-destructive">{status}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? '送信中...' : 'リセットメールを送信'}
          </Button>
          <div className="text-center text-sm">
            <Link href="/login" className="text-muted-foreground hover:underline">ログインへ戻る</Link>
          </div>
        </form>
      )}
    </Formik>
  )
}
