'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { UserIcon, ImageIcon, MailIcon, LockIcon, LogOutIcon, Trash2Icon, ChevronRightIcon } from 'lucide-react'

export default function ProfilePage() {
  const { user, signOut } = useAuth()

  if (!user) return null

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>マイページ</BreadcrumbPage>
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
          {user.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
          <Badge variant="secondary">{user.role === 'admin' ? '管理者' : '一般'}</Badge>
        </div>
      </div>
      <div className="divide-y rounded-md border">
        <Link href="/me/name" className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
          <UserIcon className="h-5 w-5 text-muted-foreground" />
          <span className="flex-1">名前を変更</span>
          <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
        </Link>
        <Link href="/me/icon" className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
          <span className="flex-1">アイコンを変更</span>
          <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
        </Link>
        <Link href="/me/email" className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
          <MailIcon className="h-5 w-5 text-muted-foreground" />
          <span className="flex-1">メールアドレスを変更</span>
          <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
        </Link>
        <Link href="/me/password" className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
          <LockIcon className="h-5 w-5 text-muted-foreground" />
          <span className="flex-1">パスワードを変更</span>
          <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
        </Link>
      </div>
      <div className="divide-y rounded-md border border-destructive/30">
        <button onClick={signOut} className="flex w-full items-center gap-3 px-4 py-3 hover:bg-destructive/5 transition-colors text-destructive">
          <LogOutIcon className="h-5 w-5" />
          <span className="flex-1 text-left">ログアウト</span>
          <ChevronRightIcon className="h-5 w-5" />
        </button>
        <Link href="/me/delete" className="flex items-center gap-3 px-4 py-3 hover:bg-destructive/5 transition-colors text-destructive">
          <Trash2Icon className="h-5 w-5" />
          <span className="flex-1">アカウントを削除</span>
          <ChevronRightIcon className="h-5 w-5" />
        </Link>
      </div>
    </div>
  )
}
