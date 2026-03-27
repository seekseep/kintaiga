'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Formik } from 'formik'
import { useAuth } from '@/hooks/use-auth'
import { useUploadMyIcon } from '@/hooks/api/me'
import { UpdateIconParametersSchema } from '@db/validation'
import { zodValidate } from '@/lib/form/zod-adapter'
import { toast } from 'sonner'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function EditIconPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)

  const mutation = useUploadMyIcon()

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/me">マイページ</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>アイコン編集</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle>アイコンの変更</CardTitle>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{ icon: '' }}
            validate={zodValidate(UpdateIconParametersSchema)}
            onSubmit={(values) => mutation.mutate(values, {
              onSuccess: async () => {
                await refreshUser()
                toast.success('アイコンを変更しました')
                router.push('/me')
              },
              onError: () => toast.error('変更に失敗しました'),
            })}
          >
            {({ handleSubmit, values, setFieldValue }) => (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
                <div className="flex justify-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={values.icon || user?.iconUrl || undefined} />
                    <AvatarFallback className="text-2xl">{user?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = () => setFieldValue('icon', reader.result as string)
                    reader.readAsDataURL(file)
                  }}
                />
                <Button type="button" variant="outline" className="w-full" onClick={() => fileRef.current?.click()}>
                  画像を選択
                </Button>
                <Button type="submit" className="w-full" disabled={mutation.isPending || !values.icon}>
                  {mutation.isPending ? 'アップロード中...' : 'アップロード'}
                </Button>
              </form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  )
}
