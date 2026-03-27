'use client'

import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'
import { getProject } from '@/api/projects'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'
import { Pencil } from 'lucide-react'

export default function ProjectDetailLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>()
  const pathname = usePathname()
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'admin'

  const { data: project, isLoading } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => getProject(id),
  })

  if (isLoading) return <Skeleton className="h-64" />
  if (!project) return <p className="text-center text-muted-foreground">プロジェクトが見つかりません</p>

  const basePath = `/projects/${id}`
  const tabs = [
    { label: 'メンバー', href: basePath },
    ...(isAdmin ? [{ label: '設定', href: `${basePath}/settings` }] : []),
  ]

  function isActive(href: string) {
    if (href === basePath) {
      return pathname === basePath || pathname.startsWith(`${basePath}/users`)
    }
    return pathname.startsWith(href)
  }

  // サブページ（name, description 編集など）はタブを表示しない
  const isSubPage = ['/name', '/description'].some(p => pathname.endsWith(p))
  if (isSubPage) return <>{children}</>

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">プロジェクト</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* プロジェクトヘッダー */}
      <div className="space-y-1">
        {isAdmin ? (
          <Link href={`${basePath}/name`} className="group flex items-center gap-2">
            <h1 className="font-bold text-lg my-0">{project.name}</h1>
            <Pencil className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ) : (
          <h1 className="font-bold text-lg">{project.name}</h1>
        )}

        {isAdmin ? (
          <Link href={`${basePath}/description`} className="group flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              {project.description || '説明なし'}
            </p>
            <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ) : (
          project.description && (
            <p className="text-sm text-muted-foreground">{project.description}</p>
          )
        )}
      </div>

      {/* タブナビゲーション */}
      <nav className="flex border-b">
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              isActive(tab.href)
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  )
}
