import { Navigate, Outlet, Link, useLocation } from 'react-router'
import { useAuth } from '@/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
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
import { Clock, LayoutDashboard, Users, FolderOpen, User, LogOut } from 'lucide-react'

export function AppLayout() {
  const { session, user, isLoading, needsInitialization, signOut } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Skeleton className="h-32 w-32 rounded-lg" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (needsInitialization && location.pathname !== '/me/initialize') {
    return <Navigate to="/me/initialize" replace />
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link to="/" className="text-lg font-semibold">
            KinTimeCard
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/'}>
                <Link to="/">
                  <LayoutDashboard />
                  <span>ダッシュボード</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname.startsWith('/activities')}>
                <Link to="/activities/new">
                  <Clock />
                  <span>アクティビティ</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {user?.role === 'admin' && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname.startsWith('/users')}>
                    <Link to="/users">
                      <Users />
                      <span>ユーザー</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname.startsWith('/projects')}>
                    <Link to="/projects">
                      <FolderOpen />
                      <span>プロジェクト</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
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
                  <Link to="/me">
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
          <Separator orientation="vertical" className="h-6" />
        </header>
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
