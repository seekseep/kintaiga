'use client'

import Link from 'next/link'
import { useMyOrganizations } from '@/hooks/api/organizations'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Building2, Plus, Crown, Shield, User } from 'lucide-react'

const roleIcons = {
  owner: Crown,
  manager: Shield,
  worker: User,
}

const roleLabels = {
  owner: 'オーナー',
  manager: 'マネージャー',
  worker: 'メンバー',
}

export default function OrganizationsPage() {
  const { data: organizations, isLoading } = useMyOrganizations()
  const organizationItems = organizations?.items ?? []

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <img src="/favicon.png" alt="キンタイガ" className="animate-pulse h-16 w-16" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">組織一覧</h1>
        <Button asChild>
          <Link href="/organizations/new">
            <Plus className="mr-2 h-4 w-4" />
            組織を作成
          </Link>
        </Button>
      </div>

      {organizationItems.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">所属する組織がありません</CardTitle>
            <CardDescription className="text-center">
              組織を作成して始めましょう
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4">
        {organizationItems.map((organization) => {
          const RoleIcon = roleIcons[organization.organizationRole]
          return (
            <Link key={organization.id} href={`/${organization.name}/projects`}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1">
                    <CardTitle>{organization.displayName}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <RoleIcon className="h-3 w-3" />
                      {roleLabels[organization.organizationRole]}
                      {organization.plan === 'premium' && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">Premium</span>
                      )}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
