import { useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { getProject } from '@/api/projects'
import { getUser } from '@/api/users'
import { getActivities } from '@/api/activities'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'

export function ProjectUserActivitiesPage() {
  const { projectId, userId } = useParams()

  const { data: project } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => getProject(projectId!),
  })

  const { data: user } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => getUser(userId!),
  })

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities', { userId }],
    queryFn: () => getActivities(userId),
  })

  if (isLoading) return <Skeleton className="h-64" />

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/projects">プロジェクト</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/projects/${projectId}`}>{project?.name}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{user?.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl font-bold">{user?.name} のアクティビティ</h1>

      {activities.length === 0 ? (
        <p className="text-muted-foreground">アクティビティがありません</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>タイプ</TableHead>
              <TableHead>開始日時</TableHead>
              <TableHead>終了日時</TableHead>
              <TableHead>メモ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map(a => (
              <TableRow key={a.id}>
                <TableCell><Badge variant="secondary">{a.type}</Badge></TableCell>
                <TableCell>{new Date(a.startedAt).toLocaleString('ja-JP')}</TableCell>
                <TableCell>{a.endedAt ? new Date(a.endedAt).toLocaleString('ja-JP') : '-'}</TableCell>
                <TableCell className="text-muted-foreground">{a.note ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
