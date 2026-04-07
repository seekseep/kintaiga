'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
import { useMyOrganizations } from '@/hooks/api/organizations'
import { FolderOpen, Clock, Users, User, LogOut, Settings, Building2, ChevronsUpDown, Plus } from 'lucide-react'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, user, isLoading, needsInitialization, error, signOut, refreshUser } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const routeParameters = useParams<{ organizationName?: string }>()
  const organizationName = routeParameters?.organizationName

  const { data: organizations } = useMyOrganizations({ enabled: !!user })
  const organizationItems = organizations?.items ?? []

  useEffect(() => {
    if (!isLoading && !session) {
      // Supabase がハッシュフラグメントでエラーを返す場合がある
      // 例: /#error=access_denied&error_code=otp_expired&error_description=...
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const errorCode = params.get('error_code')
      if (errorCode) {
        router.replace(`/login?auth_error=${encodeURIComponent(errorCode)}`)
      } else {
        router.replace('/login')
      }
    }
  }, [isLoading, session, router])

  useEffect(() => {
    if (!isLoading && needsInitialization) {
      router.replace('/initialize')
    }
  }, [isLoading, needsInitialization, pathname, router])

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <img src="/favicon.png" alt="キンタイガ" className="animate-pulse h-24 w-24" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (!user) {
    if (error) {
      return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
          <img src="/favicon.png" alt="キンタイガ" className="h-24 w-24 opacity-50" />
          <p className="text-sm text-muted-foreground">ユーザー情報の取得に失敗しました</p>
          <p className="text-xs text-muted-foreground">{error.message}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => refreshUser()}
              className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
            >
              再試行
            </button>
            <button
              type="button"
              onClick={() => signOut().then(() => router.replace('/login'))}
              className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
            >
              ログアウト
            </button>
          </div>
        </div>
      )
    }
    return (
      <div className="flex min-h-svh items-center justify-center">
        <img src="/favicon.png" alt="キンタイガ" className="animate-pulse h-24 w-24" />
      </div>
    )
  }

  const organizationPrefix = organizationName ? `/${organizationName}` : ''
  const currentOrganization = organizationItems.find(o => o.name === organizationName)
  const isOwnerOrManager = currentOrganization?.organizationRole === 'owner' || currentOrganization?.organizationRole === 'manager'

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-2">
          <Link href="/" className="text-lg font-semibold">
            キンタイガ
          </Link>
          {organizationName && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-2 rounded-md p-2 text-sm hover:bg-sidebar-accent">
                  <Building2 className="h-4 w-4" />
                  <span className="flex-1 truncate text-left">{organizationItems.find(o => o.name === organizationName)?.displayName ?? organizationName}</span>
                  <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {organizationItems.map((organization) => (
                  <DropdownMenuItem key={organization.id} asChild>
                    <Link href={`/${organization.name}/projects`}>
                      <Building2 className="h-4 w-4" />
                      {organization.displayName}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem asChild>
                  <Link href="/organizations/new">
                    <Plus className="h-4 w-4" />
                    組織を作成
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
          <SidebarMenu>
            {organizationName && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === `${organizationPrefix}` || pathname.startsWith(`${organizationPrefix}/projects`)}>
                    <Link href={`${organizationPrefix}/projects`}>
                      <FolderOpen />
                      <span>プロジェクト</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(`${organizationPrefix}/activities`)}>
                    <Link href={`${organizationPrefix}/activities`}>
                      <Clock />
                      <span>稼働</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {isOwnerOrManager && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname.startsWith(`${organizationPrefix}/members`)}>
                        <Link href={`${organizationPrefix}/members`}>
                          <Users />
                          <span>メンバー</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname.startsWith(`${organizationPrefix}/configuration`)}>
                        <Link href={`${organizationPrefix}/configuration`}>
                          <Settings />
                          <span>設定</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
              </>
            )}
            {!organizationName && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/'}>
                  <Link href="/">
                    <Building2 />
                    <span>組織一覧</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
          </SidebarGroup>
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
          <SidebarTrigger />
          <Separator orientation="vertical" />
        </header>
        <main className="flex-1 p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
