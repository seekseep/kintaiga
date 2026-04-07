'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMembers } from '@/hooks/api/members'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Plus, RefreshCw } from 'lucide-react'

export default function UserListPage() {
  const { organizationName } = useParams<{ organizationName: string }>()
  const { data: membersData, isLoading, isFetching, refetch } = useMembers()

  const members = membersData?.items ?? []

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>メンバー</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">メンバー</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="再読み込み"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button asChild>
            <Link href={`/${organizationName}/members/invite`}><Plus className="mr-2 h-4 w-4" />メンバーを招待</Link>
          </Button>
        </div>
      </div>
      {isLoading ? (
        <div className="rounded-xl ring-1 ring-foreground/10 overflow-hidden">
          <div className="flex border-b">
            <div className="h-10 px-2 flex-1 flex items-center"><Skeleton className="h-4 w-20" /></div>
            <div className="h-10 px-2 flex items-center"><Skeleton className="h-4 w-12" /></div>
          </div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex border-b last:border-0">
              <div className="h-12 px-2 flex-1 flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="h-12 px-2 flex items-center">
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>メンバー</TableHead>
              <TableHead>権限</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map(u => (
              <TableRow key={u.id} className="cursor-pointer" onClick={() => {}}>
                <TableCell>
                  <Link href={`/${organizationName}/members/${u.id}`} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.iconUrl ?? undefined} />
                      <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span>{u.name}</span>
                      <span className="text-xs text-muted-foreground">{u.email ?? '—'}</span>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={u.organizationRole === 'owner' ? 'default' : u.organizationRole === 'manager' ? 'outline' : 'secondary'}>
                    {u.organizationRole === 'owner' ? 'オーナー' : u.organizationRole === 'manager' ? 'マネージャー' : 'メンバー'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
