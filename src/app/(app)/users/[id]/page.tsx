'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useUser, useDeleteUser } from '@/hooks/api/users'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

import { Skeleton } from '@/components/ui/skeleton'
import { ChevronRightIcon, Trash2Icon } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: user, isLoading } = useUser(id)
  const deleteMutation = useDeleteUser()

  if (isLoading) return <Skeleton className="mx-auto h-64 max-w-lg" />
  if (!user) return <p className="text-center text-muted-foreground">ユーザーが見つかりません</p>

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href="/users">ユーザー</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{user.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.iconUrl ?? undefined} />
          <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-medium">{user.name}</p>
          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
            {user.role === 'admin' ? '管理者' : '一般'}
          </Badge>
        </div>
      </div>

      <div className="divide-y rounded-md border">
        <Link href={`/users/${id}/name`} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
          <div>
            <p className="text-sm text-muted-foreground">名前</p>
            <p>{user.name}</p>
          </div>
          <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
        </Link>
        <Link href={`/users/${id}/role`} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
          <div>
            <p className="text-sm text-muted-foreground">ロール</p>
            <p>{user.role === 'admin' ? '管理者' : '一般'}</p>
          </div>
          <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
        </Link>
      </div>

      <div className="divide-y rounded-md border border-destructive/30">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex w-full items-center gap-3 px-4 py-3 hover:bg-destructive/5 transition-colors text-destructive">
              <Trash2Icon className="h-5 w-5" />
              <span className="flex-1 text-left">ユーザーを削除</span>
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
              <AlertDialogDescription>このユーザーに関連するデータも削除されます。</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteMutation.mutate(id, {
                onSuccess: () => {
                  toast.success('削除しました')
                  router.push('/users')
                },
              })}>削除</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
