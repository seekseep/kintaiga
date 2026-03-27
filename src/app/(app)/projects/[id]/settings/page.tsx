'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Formik } from 'formik'
import { getProject, updateProject } from '@/api/projects'
import { getConfiguration } from '@/api/configurations'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AdminGuard } from '@/components/layouts/admin-guard'
import { Skeleton } from '@/components/ui/skeleton'

const ROUNDING_INTERVALS = [1, 5, 10, 15, 30, 60] as const
const USE_GLOBAL = '__global__'

function labelForInterval(v: number) {
  return `${v}分`
}

function labelForDirection(v: string) {
  return v === 'ceil' ? '切り上げ' : '切り下げ'
}

function labelForUnit(v: string) {
  return v === 'monthly' ? '1ヶ月' : 'なし'
}

export default function ProjectSettingsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => getProject(id),
  })

  const { data: globalConfig, isLoading: loadingConfig } = useQuery({
    queryKey: ['configuration'],
    queryFn: getConfiguration,
  })

  const mutation = useMutation({
    mutationFn: (values: { roundingInterval: string; roundingDirection: string; aggregationUnit: string }) =>
      updateProject(id, {
        roundingInterval: values.roundingInterval === USE_GLOBAL ? null : Number(values.roundingInterval),
        roundingDirection: values.roundingDirection === USE_GLOBAL ? null : values.roundingDirection as 'ceil' | 'floor',
        aggregationUnit: values.aggregationUnit === USE_GLOBAL ? null : values.aggregationUnit as 'monthly' | 'none',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', id] })
      toast.success('プロジェクト設定を更新しました')
      router.push(`/projects/${id}`)
    },
    onError: () => toast.error('更新に失敗しました'),
  })

  if (loadingProject || loadingConfig) return <Skeleton className="h-64" />

  return (
    <AdminGuard>
      <div className="mx-auto max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>プロジェクト設定</CardTitle>
          </CardHeader>
          <CardContent>
            <Formik
              enableReinitialize
              initialValues={{
                roundingInterval: project?.roundingInterval != null ? String(project.roundingInterval) : USE_GLOBAL,
                roundingDirection: project?.roundingDirection ?? USE_GLOBAL,
                aggregationUnit: project?.aggregationUnit ?? USE_GLOBAL,
              }}
              onSubmit={(values) => mutation.mutate(values)}
            >
              {({ handleSubmit }) => (
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
                  <FormField name="roundingInterval" label="丸め間隔（分）">
                    {({ field, helpers }) => (
                      <Select value={field.value} onValueChange={(v) => helpers.setValue(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={USE_GLOBAL}>
                            全体設定を使用{globalConfig ? `（${labelForInterval(globalConfig.roundingInterval)}）` : ''}
                          </SelectItem>
                          {ROUNDING_INTERVALS.map(v => (
                            <SelectItem key={v} value={String(v)}>{v}分</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </FormField>
                  <FormField name="roundingDirection" label="丸め方向">
                    {({ field, helpers }) => (
                      <Select value={field.value} onValueChange={(v) => helpers.setValue(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={USE_GLOBAL}>
                            全体設定を使用{globalConfig ? `（${labelForDirection(globalConfig.roundingDirection)}）` : ''}
                          </SelectItem>
                          <SelectItem value="ceil">切り上げ</SelectItem>
                          <SelectItem value="floor">切り下げ</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </FormField>
                  <FormField name="aggregationUnit" label="集計単位">
                    {({ field, helpers }) => (
                      <Select value={field.value} onValueChange={(v) => helpers.setValue(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={USE_GLOBAL}>
                            全体設定を使用{globalConfig ? `（${labelForUnit(globalConfig.aggregationUnit)}）` : ''}
                          </SelectItem>
                          <SelectItem value="monthly">1ヶ月</SelectItem>
                          <SelectItem value="none">なし</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </FormField>
                  <Button type="submit" className="w-full" disabled={mutation.isPending}>
                    {mutation.isPending ? '保存中...' : '保存'}
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
