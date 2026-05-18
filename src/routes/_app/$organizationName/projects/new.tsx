import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Formik } from 'formik'
import { toast } from 'sonner'
import { useCreateProject } from '@/hooks/api/projects'
import { useCreateProjectMember } from '@/hooks/api/project-members'
import { useAuth } from '@/hooks/use-auth'
import { CreateOrganizationProjectParametersSchema } from '@/services/organization/project/createOrganizationProject'
import { zodValidate } from '@/lib/form/zod-adapter'
import { Button } from '@/components/ui/button'
import { FormInput, FormTextarea } from '@/components/form'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { OrganizationRoleGuard } from '@/components/layouts/organization-role-guard'

export const Route = createFileRoute('/_app/$organizationName/projects/new')({
  component: ProjectNewPage,
})

function ProjectNewPage() {
  const navigate = useNavigate()
  const { organizationName } = Route.useParams()
  const mutation = useCreateProject()
  const memberMutation = useCreateProjectMember()
  const { user } = useAuth()

  return (
    <OrganizationRoleGuard allowedRoles={['owner', 'manager']}>
      <div className="mx-auto max-w-lg space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink to={`/${organizationName}/projects`}>プロジェクト</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>新規作成</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Card>
          <CardHeader>
            <CardTitle>新規プロジェクト</CardTitle>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={{ name: '', description: '', joinProject: true }}
              validate={(values) =>
                zodValidate(CreateOrganizationProjectParametersSchema)({
                  name: values.name,
                  description: values.description,
                })
              }
              onSubmit={(values) =>
                mutation.mutate(
                  { name: values.name, description: values.description || undefined },
                  {
                    onSuccess: (project) => {
                      if (values.joinProject && user) {
                        memberMutation.mutate(
                          {
                            projectId: project.id,
                            userId: user.id,
                            startedAt: new Date().toISOString(),
                            endedAt: null,
                          },
                          {
                            onSuccess: () => {
                              toast.success('プロジェクトを作成しました')
                              navigate({ to: `/${organizationName}/projects/${project.id}` })
                            },
                            onError: () => {
                              toast.success('プロジェクトを作成しました')
                              toast.error('参加に失敗しました')
                              navigate({ to: `/${organizationName}/projects/${project.id}` })
                            },
                          },
                        )
                      } else {
                        toast.success('プロジェクトを作成しました')
                        navigate({ to: `/${organizationName}/projects/${project.id}` })
                      }
                    },
                    onError: () => toast.error('作成に失敗しました'),
                  },
                )
              }
            >
              {({ handleSubmit, values, setFieldValue }) => (
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
                  <FormInput name="name" label="名前" />
                  <FormTextarea name="description" label="説明（任意）" />
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="joinProject"
                      checked={values.joinProject}
                      onCheckedChange={(checked) => setFieldValue('joinProject', checked === true)}
                    />
                    <Label htmlFor="joinProject">自分もプロジェクトに参加する</Label>
                  </div>
                  <Button type="submit" className="w-full" disabled={mutation.isPending || memberMutation.isPending}>
                    {mutation.isPending || memberMutation.isPending ? '作成中...' : '作成'}
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
