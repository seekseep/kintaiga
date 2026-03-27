'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getProject } from '@/api/projects'
import { getUser } from '@/api/users'
import { getActivities, type Activity } from '@/api/activities'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EditActivityDialog } from '@/components/edit-activity-dialog'
import { ElapsedTime } from '@/components/elapsed-time'

export default function ProjectUserActivitiesPage() {
  const { id: projectId, userId } = useParams<{ id: string; userId: string }>()
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)

  const { data: project } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => getProject(projectId),
  })

  const { data: user } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => getUser(userId),
  })

  const { data: activitiesData, isLoading } = useQuery({
    queryKey: ['activities', { projectId, userId }],
    queryFn: () => getActivities({ projectId, userId }),
  })

  const activities = activitiesData?.items ?? []

  if (isLoading) return <Skeleton className="h-64" />

  return (
    <div className="space-y-4">
      <h1 className="font-bold text-lg">{user?.name} の稼働</h1>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            稼働がありません
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>開始</TableHead>
              <TableHead>終了</TableHead>
              <TableHead>経過時間</TableHead>
              <TableHead>メモ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map(activity => (
              <TableRow
                key={activity.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setEditingActivity(activity)}
              >
                <TableCell>{new Date(activity.startedAt).toLocaleString('ja-JP')}</TableCell>
                <TableCell>
                  {activity.endedAt
                    ? new Date(activity.endedAt).toLocaleString('ja-JP')
                    : <Badge variant="default">進行中</Badge>
                  }
                </TableCell>
                <TableCell><ElapsedTime startedAt={activity.startedAt} endedAt={activity.endedAt} /></TableCell>
                <TableCell className="text-muted-foreground">{activity.note ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {editingActivity && (
        <EditActivityDialog
          activity={editingActivity}
          open={true}
          onOpenChange={(open) => { if (!open) setEditingActivity(null) }}
        />
      )}
    </div>
  )
}
