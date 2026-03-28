'use client'

import { useRouter, useParams } from 'next/navigation'
import { Formik } from 'formik'
import { useCreateProject } from '@/hooks/api/projects'
import { CreateOrganizationProjectParametersSchema } from '@/services/organization/project/createOrganizationProject'
import { zodValidate } from '@/lib/form/zod-adapter'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FormInput, FormTextarea } from '@/components/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { OrganizationRoleGuard } from '@/components/layouts/organization-role-guard'

export default function ProjectNewPage() {
  const router = useRouter()
  const { organizationName } = useParams<{ organizationName: string }>()
  const mutation = useCreateProject()

  return (
    <OrganizationRoleGuard allowedRoles={['owner', 'manager']}>
    <div className="mx-auto max-w-lg space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href={`/${organizationName}/projects`}>プロジェクト</Link></BreadcrumbLink>
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
            initialValues={{ name: '', description: '' }}
            validate={zodValidate(CreateOrganizationProjectParametersSchema)}
            onSubmit={(values) => mutation.mutate(
              { name: values.name, description: values.description || undefined },
              {
                onSuccess: (project) => {
                  toast.success('プロジェクトを作成しました')
                  router.push(`/${organizationName}/projects/${project.id}`)
                },
                onError: () => toast.error('作成に失敗しました'),
              }
            )}
          >
            {({ handleSubmit }) => (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
                <FormInput name="name" label="名前" />
                <FormTextarea name="description" label="説明（任意）" />
                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? '作成中...' : '作成'}
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
