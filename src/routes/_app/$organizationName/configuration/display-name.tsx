import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Formik } from 'formik'
import { toast } from 'sonner'
import { useOrganization } from '@/contexts/organization-context'
import { useUpdateOrganization } from '@/hooks/api/organizations'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrganizationRoleGuard } from '@/components/layouts/organization-role-guard'
import { useOrganizationPath } from '@/hooks/use-organization-path'

export const Route = createFileRoute('/_app/$organizationName/configuration/display-name')({
  component: EditDisplayNamePage,
})

function EditDisplayNamePage() {
  const navigate = useNavigate()
  const { displayName } = useOrganization()
  const orgPath = useOrganizationPath()
  const mutation = useUpdateOrganization()

  return (
    <OrganizationRoleGuard allowedRoles={['owner', 'manager']}>
      <div className="mx-auto max-w-lg space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink to={`${orgPath}/configuration`}>設定</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>表示名の変更</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Card>
          <CardHeader>
            <CardTitle>表示名の変更</CardTitle>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={{ displayName }}
              onSubmit={(values) =>
                mutation.mutate(
                  { displayName: values.displayName },
                  {
                    onSuccess: () => {
                      toast.success('表示名を変更しました')
                      navigate({ to: `${orgPath}/configuration` })
                    },
                    onError: () => toast.error('変更に失敗しました'),
                  },
                )
              }
            >
              {({ handleSubmit }) => (
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
                  <FormInput name="displayName" label="表示名" />
                  <Button type="submit" className="w-full" disabled={mutation.isPending}>
                    {mutation.isPending ? '変更中...' : '変更する'}
                  </Button>
                </form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </div>
    </OrganizationRoleGuard>
  )
}
