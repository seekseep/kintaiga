import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Formik } from 'formik'
import { toast } from 'sonner'
import { useMember, useUpdateMemberRole } from '@/hooks/api/members'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/_app/$organizationName/members/$memberId/role')({
  component: EditMemberRolePage,
})

function EditMemberRolePage() {
  const { memberId, organizationName } = Route.useParams()
  const navigate = useNavigate()
  const { data: member, isLoading } = useMember(memberId)
  const mutation = useUpdateMemberRole()

  if (isLoading)
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Skeleton className="h-5 w-48" />
        <div className="rounded-xl ring-1 ring-foreground/10 bg-card py-4">
          <div className="px-6 pb-4"><Skeleton className="h-6 w-32" /></div>
          <div className="px-6 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>
    )

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to={`/${organizationName}/members`}>メンバー</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink to={`/${organizationName}/members/${memberId}`}>{member?.name}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>権限編集</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle>権限の変更</CardTitle>
        </CardHeader>
        <CardContent>
          <Formik
            enableReinitialize
            initialValues={{ role: member?.organizationRole ?? 'worker' }}
            onSubmit={(values) =>
              mutation.mutate(
                { id: memberId, role: values.role as 'manager' | 'worker' },
                {
                  onSuccess: () => {
                    toast.success('権限を変更しました')
                    navigate({ to: `/${organizationName}/members/${memberId}` })
                  },
                  onError: () => toast.error('変更に失敗しました'),
                },
              )
            }
          >
            {({ handleSubmit }) => (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
                <FormField name="role" label="権限">
                  {({ field, helpers }) => (
                    <Select value={field.value} onValueChange={(v) => helpers.setValue(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="worker">作業者</SelectItem>
                        <SelectItem value="manager">マネージャー</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </FormField>
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
