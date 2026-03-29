'use client'

import { useParams, useRouter } from 'next/navigation'
import { Formik } from 'formik'
import { useProject, useUpdateProject } from '@/hooks/api/projects'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrganizationRoleGuard } from '@/components/layouts/organization-role-guard'
import { Skeleton } from '@/components/ui/skeleton'

export default function EditProjectNamePage() {
  const { id, organizationName } = useParams<{ id: string; organizationName: string }>()
  const router = useRouter()
  const { data: project, isLoading } = useProject(id)
  const mutation = useUpdateProject()

  const settingsPath = `/${organizationName}/projects/${id}/settings`

  if (isLoading) return (
    <div className="mx-auto max-w-lg space-y-4">
      <Skeleton className="h-5 w-48" />
      <div className="rounded-xl ring-1 ring-foreground/10 bg-card py-4">
        <div className="px-6 pb-4"><Skeleton className="h-6 w-40" /></div>
        <div className="px-6 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </div>
  )

  return (
    <OrganizationRoleGuard allowedRoles={['owner', 'manager']}>
      <div className="mx-auto max-w-lg space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>プロジェクト名の変更</CardTitle>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={{ name: project?.name ?? '' }}
              onSubmit={(values) => {
                if (!values.name.trim()) {
                  toast.error('プロジェクト名は必須です')
                  return
                }
                mutation.mutate({ id, name: values.name }, {
                  onSuccess: () => {
                    toast.success('プロジェクト名を変更しました')
                    router.push(settingsPath)
                  },
                  onError: () => toast.error('変更に失敗しました'),
                })
              }}
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
    </OrganizationRoleGuard>
  )
}
