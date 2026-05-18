import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAddMember } from '@/hooks/api/members'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/_app/$organizationName/members/invite')({
  component: InviteMemberPage,
})

function InviteMemberPage() {
  const navigate = useNavigate()
  const { organizationName } = Route.useParams()
  const [email, setEmail] = useState('')

  const mutation = useAddMember()

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to={`/${organizationName}/members`}>メンバー</BreadcrumbLink>
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
              if (email) {
                mutation.mutate(
                  { email },
                  {
                    onSuccess: () => {
                      toast.success('メンバーを追加しました')
                      navigate({ to: `/${organizationName}/members` })
                    },
                    onError: (error: Error) => {
                      toast.error(error.message || 'メンバーの追加に失敗しました')
                    },
                  },
                )
              }
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
