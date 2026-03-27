'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { Formik } from 'formik'
import { useAuth } from '@/hooks/use-auth'
import { registerMe } from '@/api/me'
import { CreateProfileParametersSchema } from '@db/validation'
import { zodValidate } from '@/lib/form/zod-adapter'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function InitializePage() {
  const router = useRouter()
  const { session, isLoading, needsInitialization, refreshUser } = useAuth()

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace('/login')
    }
  }, [isLoading, session, router])

  useEffect(() => {
    if (!isLoading && session && !needsInitialization) {
      router.replace('/')
    }
  }, [isLoading, session, needsInitialization, router])

  const mutation = useMutation({
    mutationFn: (values: { name: string }) => registerMe(values),
    onSuccess: async () => {
      await refreshUser()
      toast.success('プロフィールを設定しました')
      router.push('/')
    },
    onError: () => toast.error('設定に失敗しました'),
  })

  if (isLoading || !session || !needsInitialization) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="animate-pulse text-8xl">🐯</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">🐯 キンタイガ</CardTitle>
          <CardDescription>はじめに表示名を設定してください。</CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{ name: '' }}
            validate={zodValidate(CreateProfileParametersSchema)}
            onSubmit={(values) => mutation.mutate(values)}
          >
            {({ handleSubmit }) => (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
                <FormInput name="name" label="名前" />
                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? '設定中...' : '設定する'}
                </Button>
              </form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  )
}
