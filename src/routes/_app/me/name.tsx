import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Formik } from 'formik'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { useUpdateMe } from '@/hooks/api/me'
import { UpdateUserParametersSchema } from '@/services/user/updateUser'
import { zodValidate } from '@/lib/form/zod-adapter'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const UpdateNameSchema = UpdateUserParametersSchema.omit({ id: true })

export const Route = createFileRoute('/_app/me/name')({
  component: EditNamePage,
})

function EditNamePage() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const mutation = useUpdateMe()

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/me">マイページ</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>名前編集</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle>名前の変更</CardTitle>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{ name: user?.name ?? '' }}
            validate={zodValidate(UpdateNameSchema)}
            onSubmit={(values) =>
              mutation.mutate(values, {
                onSuccess: async () => {
                  await refreshUser()
                  toast.success('名前を変更しました')
                  navigate({ to: '/me' })
                },
                onError: () => toast.error('変更に失敗しました'),
              })
            }
          >
            {({ handleSubmit }) => (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
                <FormInput name="name" label="名前" />
                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? '変更中...' : '変更する'}
                </Button>
              </form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  )
}
