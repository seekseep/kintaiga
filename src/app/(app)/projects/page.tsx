'use client'

import Link from 'next/link'
import { useUserProjectStatements } from '@/hooks/api/projects'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Plus } from 'lucide-react'
import { AdminGuard } from '@/components/layouts/admin-guard'

export default function ProjectListPage() {
  const { data: projectsData, isLoading } = useUserProjectStatements()

  const projects = projectsData?.items ?? []

  return (
    <AdminGuard>
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>プロジェクト</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">プロジェクト</h1>
        <Button asChild>
          <Link href="/projects/new"><Plus className="mr-2 h-4 w-4" />新規プロジェクト</Link>
        </Button>
      </div>
      {isLoading ? (
        <div className="rounded-xl ring-1 ring-foreground/10 overflow-hidden">
          <div className="flex border-b">
            <div className="h-10 px-2 flex-1 flex items-center"><Skeleton className="h-4 w-16" /></div>
            <div className="h-10 px-2 flex-1 flex items-center"><Skeleton className="h-4 w-16" /></div>
          </div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex border-b last:border-0">
              <div className="h-10 px-2 flex-1 flex items-center"><Skeleton className="h-4 w-32" /></div>
              <div className="h-10 px-2 flex-1 flex items-center"><Skeleton className="h-4 w-48" /></div>
            </div>
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名前</TableHead>
              <TableHead>説明</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map(p => (
              <TableRow key={p.id}>
                <TableCell>
                  <Link href={`/projects/${p.id}`} className="hover:underline">{p.name}</Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{p.description ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
    </AdminGuard>
  )
}
