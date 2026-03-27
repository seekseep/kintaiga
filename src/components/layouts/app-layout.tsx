'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Clock, LayoutDashboard, Users, FolderOpen, User, LogOut } from 'lucide-react'
import { SidebarNavigation } from '@/components/features/sidebar-navigation'
import type { MenuItem } from '@/components/features/sidebar-navigation'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, user, isLoading, needsInitialization, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace('/login')
    }
  }, [isLoading, session, router])

  useEffect(() => {
    if (!isLoading && needsInitialization && pathname !== '/me/initialize') {
      router.replace('/me/initialize')
    }
  }, [isLoading, needsInitialization, pathname, router])

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Skeleton className="h-32 w-32 rounded-lg" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const menuItems: MenuItem[] = useMemo(() => {
    const items: MenuItem[] = [
      { href: '/', icon: LayoutDashboard, label: 'ダッシュボード', isActive: (p) => p === '/' },
      { href: '/activities', icon: Clock, label: '稼働', isActive: (p) => p.startsWith('/activities') },
    ]
    if (user?.role === 'admin') {
      items.push(
        { href: '/users', icon: Users, label: 'ユーザー', isActive: (p) => p.startsWith('/users') },
        { href: '/projects', icon: FolderOpen, label: 'プロジェクト', isActive: (p) => p.startsWith('/projects') },
      )
    }
    return items
  }, [user?.role])

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/" className="text-lg font-semibold">
            kintaiga
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNavigation menuItems={menuItems} />
        </SidebarContent>
        <SidebarFooter className="p-2">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-sidebar-accent">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.iconUrl ?? undefined} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm">{user.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/me">
                    <User />
                    マイページ
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger className="size-10" />
          <Separator orientation="vertical" className="h-6" />
        </header>
        <main className="flex-1 p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
