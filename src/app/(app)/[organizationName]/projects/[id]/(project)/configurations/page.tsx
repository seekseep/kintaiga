'use client'

import { useParams, useRouter } from 'next/navigation'
import { Formik } from 'formik'
import { useProject, useProjectConfig, useUpdateProjectConfig } from '@/hooks/api/projects'
import { useConfiguration } from '@/hooks/api/configurations'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { OrganizationRoleGuard } from '@/components/layouts/organization-role-guard'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

const ROUNDING_INTERVALS = [1, 5, 10, 15, 20, 30, 60] as const
const USE_GLOBAL = '__global__'

function labelForInterval(v: number) {
  return `${v}分`
}

function labelForDirection(v: string) {
  return v === 'ceil' ? '切り上げ' : '切り下げ'
}

function labelForUnit(v: string) {
  if (v === 'weekly') return '週'
  if (v === 'monthly') return '月'
  return 'なし'
}

function labelForPeriod(period: number, unit: string) {
  if (unit === 'weekly') return `${period}週`
  if (unit === 'monthly') return `${period}ヶ月`
  return String(period)
}

export default function ProjectSettingsPage() {
  const { id, organizationName } = useParams<{ id: string; organizationName: string }>()
  const router = useRouter()

  const { data: project, isLoading: loadingProject } = useProject(id)
  const { data: projectConfig, isLoading: loadingProjectConfig } = useProjectConfig(id)

  const { data: globalConfig, isLoading: loadingConfig } = useConfiguration()

  const mutation = useUpdateProjectConfig()

  if (loadingProject || loadingProjectConfig || loadingConfig) return (
    <div className="mx-auto max-w-lg space-y-4">
      <Skeleton className="h-5 w-56" />
      <div className="rounded-xl ring-1 ring-foreground/10 bg-card py-4">
        <div className="px-6 pb-4">
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="px-6 space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </div>
  )

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
              <BreadcrumbLink asChild><Link href={`/${organizationName}/projects/${id}`}>{project?.name}</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>設定</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Card>
          <CardHeader>
            <CardTitle>{project?.name} の設定</CardTitle>
          </CardHeader>
            <CardContent>
              <Formik
                enableReinitialize
                initialValues={{
                  roundingInterval: projectConfig?.roundingInterval != null ? String(projectConfig.roundingInterval) : USE_GLOBAL,
                  roundingDirection: projectConfig?.roundingDirection ?? USE_GLOBAL,
                  aggregationUnit: projectConfig?.aggregationUnit ?? USE_GLOBAL,
                  aggregationPeriod: projectConfig?.aggregationPeriod != null ? String(projectConfig.aggregationPeriod) : USE_GLOBAL,
                }}
                onSubmit={(values) => mutation.mutate(
                  {
                    id,
                    roundingInterval: values.roundingInterval === USE_GLOBAL ? null : Number(values.roundingInterval),
                    roundingDirection: values.roundingDirection === USE_GLOBAL ? null : (values.roundingDirection as 'ceil' | 'floor'),
                    aggregationUnit: values.aggregationUnit === USE_GLOBAL ? null : (values.aggregationUnit as 'weekly' | 'monthly' | 'none'),
                    aggregationPeriod: values.aggregationPeriod === USE_GLOBAL ? null : Number(values.aggregationPeriod),
                  },
                  {
                    onSuccess: () => {
                      toast.success('プロジェクト設定を更新しました')
                      router.push(`/${organizationName}/projects/${id}`)
                    },
                    onError: () => toast.error('更新に失敗しました'),
                  },
                )}
              >
                {({ handleSubmit, values }) => (
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
                            <SelectItem value="weekly">週</SelectItem>
                            <SelectItem value="monthly">月</SelectItem>
                            <SelectItem value="none">なし</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </FormField>
                    {(values.aggregationUnit !== 'none' && values.aggregationUnit !== USE_GLOBAL) || (values.aggregationUnit === USE_GLOBAL && globalConfig?.aggregationUnit !== 'none') ? (
                      <FormField name="aggregationPeriod" label="集計期間">
                        {({ field, helpers }) => {
                          const resolvedUnit = values.aggregationUnit === USE_GLOBAL ? globalConfig?.aggregationUnit : values.aggregationUnit
                          const unitLabel = resolvedUnit === 'weekly' ? '週' : 'ヶ月'
                          return (
                            <Select value={field.value} onValueChange={(v) => helpers.setValue(v)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={USE_GLOBAL}>
                                  全体設定を使用{globalConfig ? `（${labelForPeriod(globalConfig.aggregationPeriod, globalConfig.aggregationUnit)}）` : ''}
                                </SelectItem>
                                {Array.from({ length: 12 }, (_, i) => (
                                  <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}{unitLabel}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )
                        }}
                      </FormField>
                    ) : null}
                    <Button type="submit" className="w-full" disabled={mutation.isPending}>
                      {mutation.isPending ? '保存中...' : '保存'}
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
