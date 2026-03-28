'use client'

import { Formik } from 'formik'
import { type Configuration } from '@/api/organization/configuration'
import { useConfiguration, useUpdateConfiguration } from '@/hooks/api/configurations'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FormSelect } from '@/components/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { OrganizationRoleGuard } from '@/components/layouts/organization-role-guard'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrganizationPath } from '@/hooks/use-organization-path'

const ROUNDING_INTERVALS = [1, 5, 10, 15, 20, 30, 60] as const

export default function WorkSettingsPage() {
  const { data: config, isLoading } = useConfiguration()
  const orgPath = useOrganizationPath()

  if (isLoading || !config) return (
    <div className="mx-auto max-w-lg space-y-4">
      <Skeleton className="h-5 w-48" />
      <div className="rounded-xl ring-1 ring-foreground/10 bg-card py-4">
        <div className="px-6 pb-4">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="px-6 space-y-4">
          {[1, 2, 3].map(i => (
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
              <BreadcrumbLink asChild><Link href={`${orgPath}/configuration`}>設定</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>稼働の設定</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <ConfigurationForm config={config} />
      </div>
    </OrganizationRoleGuard>
  )
}

function ConfigurationForm({ config }: { config: Configuration }) {
  const mutation = useUpdateConfiguration()

  const intervalOptions = ROUNDING_INTERVALS.map(v => ({ value: String(v), label: `${v}分` }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>稼働の設定</CardTitle>
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
  )
}
