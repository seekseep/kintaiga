'use client'

import { useRouter, useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Formik } from 'formik'
import { getProject, updateProject } from '@/api/projects'
import { zodValidate } from '@/lib/form/zod-adapter'
import { toast } from 'sonner'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { FormTextarea } from '@/components/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { z } from 'zod/v4'

const schema = z.object({ description: z.string().nullable().optional() })

export default function EditProjectDescriptionPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data: project, isLoading } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => getProject(id),
  })

  const mutation = useMutation({
    mutationFn: (values: { description?: string | null }) =>
      updateProject(id, { description: values.description || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', id] })
      toast.success('説明を変更しました')
      router.push(`/projects/${id}`)
    },
    onError: () => toast.error('変更に失敗しました'),
  })

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
            <BreadcrumbPage>説明編集</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle>説明の変更</CardTitle>
        </CardHeader>
        <CardContent>
          <Formik
            enableReinitialize
            initialValues={{ description: project?.description ?? '' }}
            validate={zodValidate(schema)}
            onSubmit={(values) => mutation.mutate(values)}
          >
            {({ handleSubmit }) => (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
                <FormTextarea name="description" label="説明" rows={4} />
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
