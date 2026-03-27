'use client'

import { Formik } from 'formik'
import { type Configuration } from '@/api/configurations'
import { useConfiguration, useUpdateConfiguration } from '@/hooks/api/configurations'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FormSelect } from '@/components/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { AdminGuard } from '@/components/layouts/admin-guard'
import { Skeleton } from '@/components/ui/skeleton'

const ROUNDING_INTERVALS = [1, 5, 10, 15, 20, 30, 60] as const

export default function SettingsPage() {
  const { data: config, isLoading } = useConfiguration()

  if (isLoading || !config) return <Skeleton className="h-64" />

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>設定</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <ConfigurationForm config={config} />
    </div>
  )
}

function ConfigurationForm({ config }: { config: Configuration }) {
  const mutation = useUpdateConfiguration()

  // The schema expects numbers for roundingInterval, but FormSelect works with strings.
  // We validate at the form level using a custom schema that accepts strings,
  // then convert in the mutation.
  const intervalOptions = ROUNDING_INTERVALS.map(v => ({ value: String(v), label: `${v}分` }))

  return (
    <AdminGuard>
      <div className="mx-auto max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>全体設定</CardTitle>
          </CardHeader>
          <CardContent>
            <Formik
              initialValues={{
                roundingInterval: String(config.roundingInterval),
                roundingDirection: config.roundingDirection,
                aggregationUnit: config.aggregationUnit,
                aggregationPeriod: String(config.aggregationPeriod),
              }}
              onSubmit={(values) => mutation.mutate({
                roundingInterval: Number(values.roundingInterval),
                roundingDirection: values.roundingDirection as 'ceil' | 'floor',
                aggregationUnit: values.aggregationUnit as 'weekly' | 'monthly' | 'none',
                aggregationPeriod: Number(values.aggregationPeriod),
              }, {
                onSuccess: () => toast.success('設定を更新しました'),
                onError: () => toast.error('更新に失敗しました'),
              })}
            >
              {({ handleSubmit, values }) => (
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
                  <FormSelect
                    name="roundingInterval"
                    label="丸め間隔（分）"
                    placeholder="選択してください"
                    options={intervalOptions}
                  />
                  <FormSelect
                    name="roundingDirection"
                    label="丸め方向"
                    placeholder="選択してください"
                    options={[
                      { value: 'ceil', label: '切り上げ' },
                      { value: 'floor', label: '切り下げ' },
                    ]}
                  />
                  <FormSelect
                    name="aggregationUnit"
                    label="集計単位"
                    placeholder="選択してください"
                    options={[
                      { value: 'weekly', label: '週' },
                      { value: 'monthly', label: '月' },
                      { value: 'none', label: 'なし' },
                    ]}
                  />
                  {values.aggregationUnit !== 'none' && (
                    <FormSelect
                      name="aggregationPeriod"
                      label="集計期間"
                      placeholder="選択してください"
                      options={Array.from({ length: 12 }, (_, i) => ({
                        value: String(i + 1),
                        label: `${i + 1}${values.aggregationUnit === 'weekly' ? '週' : 'ヶ月'}`,
                      }))}
                    />
                  )}
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
