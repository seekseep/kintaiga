'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Formik } from 'formik'
import { toast } from 'sonner'
import { z } from 'zod/v4'
import { KeyIcon, CopyIcon, Trash2Icon } from 'lucide-react'
import { useMyTokens, useCreateMyToken, useRevokeMyToken } from '@/hooks/api/me'
import { useMyOrganizations } from '@/hooks/api/organizations'
import { zodValidate } from '@/lib/form/zod-adapter'
import { FormInput, FormSelect } from '@/components/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

const CreateTokenSchema = z.object({
  name: z.string().min(1, 'トークン名を入力してください').max(255),
  organizationName: z.string().min(1, '組織を選択してください'),
})

export default function TokensPage() {
  const { data: tokensData, isLoading: tokensLoading } = useMyTokens()
  const { data: orgsData } = useMyOrganizations()
  const createMutation = useCreateMyToken()
  const revokeMutation = useRevokeMyToken()
  const [createdToken, setCreatedToken] = useState<string | null>(null)

  const orgOptions = (orgsData?.items ?? []).map((org) => ({
    value: org.name,
    label: org.displayName || org.name,
  }))

  function handleCopy(token: string) {
    navigator.clipboard.writeText(token)
    toast.success('トークンをコピーしました')
  }

  function handleRevoke(id: string) {
    revokeMutation.mutate(id, {
      onSuccess: () => toast.success('トークンを削除しました'),
      onError: () => toast.error('トークンの削除に失敗しました'),
    })
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  function isExpired(expiresAt: string | null) {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/me">マイページ</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>アクセストークン</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>トークンを発行</CardTitle>
          <CardDescription>APIアクセス用のトークンを発行します。トークンは発行時のみ表示されます。</CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{ name: '', organizationName: '' }}
            validate={zodValidate(CreateTokenSchema)}
            onSubmit={(values, { resetForm }) => {
              createMutation.mutate(values, {
                onSuccess: (data) => {
                  setCreatedToken(data.token)
                  resetForm()
                  toast.success('トークンを発行しました')
                },
                onError: () => toast.error('トークンの発行に失敗しました'),
              })
            }}
          >
            {({ handleSubmit }) => (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
                <FormInput name="name" label="トークン名" placeholder="例: CI/CD用" />
                <FormSelect
                  name="organizationName"
                  label="組織"
                  placeholder="組織を選択"
                  options={orgOptions}
                />
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? '発行中...' : '発行する'}
                </Button>
              </form>
            )}
          </Formik>

          {createdToken && (
            <div className="mt-4 rounded-md border border-yellow-500/30 bg-yellow-500/5 p-4">
              <p className="mb-2 text-sm font-medium text-yellow-600 dark:text-yellow-400">
                このトークンは今後表示されません。必ずコピーして安全な場所に保管してください。
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-x-auto rounded bg-muted px-3 py-2 text-sm">
                  {createdToken}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(createdToken)}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>トークン一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {tokensLoading ? (
            <p className="text-sm text-muted-foreground">読み込み中...</p>
          ) : !tokensData?.items.length ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <KeyIcon className="h-8 w-8" />
              <p className="text-sm">トークンはまだありません</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名前</TableHead>
                  <TableHead>組織</TableHead>
                  <TableHead>プレフィックス</TableHead>
                  <TableHead>有効期限</TableHead>
                  <TableHead>作成日</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokensData.items.map((token) => (
                  <TableRow key={token.id}>
                    <TableCell className="font-medium">{token.name}</TableCell>
                    <TableCell>{token.organizationDisplayName || token.organizationName}</TableCell>
                    <TableCell>
                      <code className="text-xs">{token.prefix}...</code>
                    </TableCell>
                    <TableCell>
                      {token.expiresAt ? (
                        <span className={isExpired(token.expiresAt) ? 'text-destructive' : ''}>
                          {formatDate(token.expiresAt)}
                          {isExpired(token.expiresAt) && <Badge variant="destructive" className="ml-1">期限切れ</Badge>}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">なし</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(token.createdAt)}</TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={revokeMutation.isPending}>
                            <Trash2Icon className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>トークンを削除</AlertDialogTitle>
                            <AlertDialogDescription>
                              トークン「{token.name}」を削除しますか？この操作は取り消せません。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>キャンセル</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRevoke(token.id)}>
                              削除する
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
