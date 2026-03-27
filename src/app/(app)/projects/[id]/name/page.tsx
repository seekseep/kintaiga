'use client'

import { useRouter, useParams } from 'next/navigation'
import { Formik } from 'formik'
import { useProject, useUpdateProject } from '@/hooks/api/projects'
import { zodValidate } from '@/lib/form/zod-adapter'
import { toast } from 'sonner'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { z } from 'zod/v4'

const schema = z.object({ name: z.string().min(1) })

export default function EditProjectNamePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const { data: project, isLoading } = useProject(id)

  const mutation = useUpdateProject()

  if (isLoading) return <Skeleton className="h-64" />

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">プロジェクト</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/projects/${id}`}>{project?.name}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>名前編集</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle>プロジェクト名の変更</CardTitle>
        </CardHeader>
        <CardContent>
          <Formik
            enableReinitialize
            initialValues={{ name: project?.name ?? '' }}
            validate={zodValidate(schema)}
            onSubmit={(values) => mutation.mutate(
              { id, body: values },
              {
                onSuccess: () => {
                  toast.success('プロジェクト名を変更しました')
                  router.push(`/projects/${id}`)
                },
                onError: () => toast.error('変更に失敗しました'),
              }
            )}
          >
            {({ handleSubmit }) => (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
                <FormInput name="name" label="プロジェクト名" />
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
