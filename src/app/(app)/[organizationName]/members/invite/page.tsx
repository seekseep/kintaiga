'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { memberKeys } from '@/lib/query-keys'
import { organizationKeys } from '@/lib/query-keys'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function InviteMemberPage() {
  const router = useRouter()
  const { organizationName } = useParams<{ organizationName: string }>()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      const r = await api.post(`/organizations/${organizationName}/members`, { email })
      return r.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.lists(organizationName) })
      queryClient.invalidateQueries({ queryKey: organizationKeys.members(organizationName) })
      toast.success('メンバーを追加しました')
      router.push(`/${organizationName}/members`)
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'メンバーの追加に失敗しました')
    },
  })

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href={`/${organizationName}/members`}>メンバー</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>メンバーを招待</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <CardTitle>メンバーを招待</CardTitle>
          <CardDescription>
            登録済みのユーザーをメールアドレスで検索して組織に追加します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (email) mutation.mutate()
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <Button type="submit" className="w-full" disabled={!email || mutation.isPending}>
              {mutation.isPending ? '追加中...' : 'メンバーを追加'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
