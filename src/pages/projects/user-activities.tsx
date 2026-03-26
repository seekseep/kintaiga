import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { api } from '@/lib/api'
import type { User } from '@/contexts/auth-context'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'

type Activity = {
  id: string
  type: string
  startedAt: string
  endedAt: string | null
  note: string | null
}

type Project = { id: string; name: string }

export function ProjectUserActivitiesPage() {
  const { projectId, userId } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<Project>(`/projects/${projectId}`),
      api.get<User>(`/users/${userId}`),
      api.get<Activity[]>(`/activities?userId=${userId}`),
    ]).then(([proj, usr, acts]) => {
      setProject(proj)
      setUser(usr)
      setActivities(acts)
    }).finally(() => setLoading(false))
  }, [projectId, userId])

  if (loading) return <Skeleton className="h-64" />

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
