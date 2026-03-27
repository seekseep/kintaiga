'use client'

import { useRouter } from 'next/navigation'
import { Formik } from 'formik'
import { useCreateProject } from '@/hooks/api/projects'
import { CreateProjectParametersSchema } from '@db/validation'
import { zodValidate } from '@/lib/form/zod-adapter'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FormInput, FormTextarea } from '@/components/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { AdminGuard } from '@/components/layouts/admin-guard'

export default function ProjectNewPage() {
  const router = useRouter()

  const mutation = useCreateProject()

  return (
    <AdminGuard>
    <div className="mx-auto max-w-lg space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">プロジェクト</BreadcrumbLink>
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
            validate={zodValidate(CreateProjectParametersSchema)}
            onSubmit={(values) => mutation.mutate(
              { name: values.name, description: values.description || undefined },
              {
                onSuccess: (project) => {
                  toast.success('プロジェクトを作成しました')
                  router.push(`/projects/${project.id}`)
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
    </AdminGuard>
  )
}
