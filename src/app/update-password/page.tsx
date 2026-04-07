'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import type { AuthError } from '@supabase/supabase-js'
import { Formik } from 'formik'
import { toast } from 'sonner'
import { z } from 'zod/v4'
import { supabase } from '@/lib/supabase'
import { zodValidate } from '@/lib/form/zod-adapter'
import { getAuthErrorMessage } from '@/lib/supabase-auth-errors'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const UpdatePasswordSchema = z.object({
  newPassword: z.string().min(6),
})

type UpdatePasswordValues = z.infer<typeof UpdatePasswordSchema>

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session)
    })
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession((current) => current ?? !!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const mutation = useMutation<void, AuthError, UpdatePasswordValues>({
    mutationFn: async (values) => {
      const { error } = await supabase.auth.updateUser({ password: values.newPassword })
      if (error) throw error
    },
    onSuccess: async () => {
      toast.success('パスワードを変更しました')
      await supabase.auth.signOut()
      router.replace('/login')
    },
  })

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">キンタイガ</CardTitle>
        </CardHeader>
        <CardContent>
          {hasSession === null ? (
            <div className="flex justify-center">
              <img src="/favicon.png" alt="キンタイガ" className="h-16 w-16 animate-pulse" />
            </div>
          ) : !hasSession ? (
            <div className="space-y-4 text-center">
              <p>リンクが無効か、有効期限が切れています。</p>
              <Link href="/reset-password" className="text-sm hover:underline">
                パスワードリセットをやり直す
              </Link>
            </div>
          ) : (
            <Formik
              initialValues={{ newPassword: '' }}
              validate={zodValidate(UpdatePasswordSchema)}
              onSubmit={(values) => mutation.mutate(values)}
            >
              {({ handleSubmit }) => (
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
                  <FormInput name="newPassword" label="新しいパスワード" type="password" />
                  {mutation.error && <p className="text-sm text-destructive">{getAuthErrorMessage(mutation.error)}</p>}
                  <Button type="submit" className="w-full" disabled={mutation.isPending}>
                    {mutation.isPending ? '変更中...' : 'パスワードを変更'}
                  </Button>
                </form>
              )}
            </Formik>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
