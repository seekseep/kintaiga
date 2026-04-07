'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useMember, useDeleteMember } from '@/hooks/api/members'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

import { Skeleton } from '@/components/ui/skeleton'
import { ChevronRightIcon, Trash2Icon } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

export default function MemberDetailPage() {
  const { memberId, organizationName } = useParams<{ memberId: string; organizationName: string }>()
  const router = useRouter()
  const { data: member, isLoading } = useMember(memberId)
  const deleteMutation = useDeleteMember()

  if (isLoading) return (
    <div className="mx-auto max-w-lg space-y-4">
      <Skeleton className="h-5 w-32" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
      <div className="divide-y rounded-md border">
        {[1, 2].map(i => (
          <div key={i} className="flex items-center justify-between px-4 py-3">
            <div className="space-y-1">
              <Skeleton className="h-3.5 w-12" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-5 w-5" />
          </div>
        ))}
      </div>
      <div className="rounded-md border border-destructive/30">
        <div className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-32 flex-1" />
          <Skeleton className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
  if (!member) return <p className="text-center text-muted-foreground">ユーザーが見つかりません</p>

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link href={`/${organizationName}/members`}>ユーザー</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{member.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={member.iconUrl ?? undefined} />
          <AvatarFallback className="text-lg">{member.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-medium">{member.name}</p>
          {member.email && <p className="text-sm text-muted-foreground">{member.email}</p>}
        </div>
      </div>

      <div className="divide-y rounded-md border">
        <Link href={`/${organizationName}/members/${memberId}/role`} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
          <div>
            <p className="text-sm text-muted-foreground">権限</p>
            <p>{member.organizationRole === 'owner' ? 'オーナー' : member.organizationRole === 'manager' ? 'マネージャー' : '作業者'}</p>
          </div>
          <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
        </Link>
      </div>

      <div className="divide-y rounded-md border border-destructive/30">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex w-full items-center gap-3 px-4 py-3 hover:bg-destructive/5 transition-colors text-destructive">
              <Trash2Icon className="h-5 w-5" />
              <span className="flex-1 text-left">組織からメンバーを削除</span>
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
              <AlertDialogAction onClick={() => deleteMutation.mutate(memberId, {
                onSuccess: () => {
                  toast.success('削除しました')
                  router.push(`/${organizationName}/members`)
                },
              })}>削除</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
