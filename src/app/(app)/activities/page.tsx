'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getActivities, type Activity } from '@/api/activities'
import { getMyProjects } from '@/api/me'
import { useAuth } from '@/hooks/use-auth'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { EditActivityDialog } from '@/components/edit-activity-dialog'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { ElapsedTime, calcElapsedMinutes } from '@/components/elapsed-time'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function getMonthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
  return { startDate: start.toISOString(), endDate: end.toISOString() }
}

function formatMonth(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

function groupByDate(activities: Activity[]) {
  const groups: { date: string; activities: Activity[] }[] = []
  let currentDate = ''
  for (const activity of activities) {
    const dateKey = new Date(activity.startedAt).toLocaleDateString('ja-JP')
    if (dateKey !== currentDate) {
      currentDate = dateKey
      groups.push({ date: dateKey, activities: [] })
    }
    groups[groups.length - 1].activities.push(activity)
  }
  return groups
}

export default function ActivitiesPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const { startDate, endDate } = useMemo(() => getMonthRange(currentMonth), [currentMonth])
  const colCount = isAdmin ? 6 : 5

  const goToPrevMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const goToNextMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  const { data: myProjectsData } = useQuery({
    queryKey: ['me', 'projects'],
    queryFn: () => getMyProjects(),
  })

  const { data: activitiesData, isLoading } = useQuery({
    queryKey: ['activities', { projectId: projectFilter === 'all' ? undefined : projectFilter, startDate, endDate }],
    queryFn: () => getActivities({
      projectId: projectFilter === 'all' ? undefined : projectFilter,
      startDate,
      endDate,
      limit: 100,
    }),
  })

  const myProjects = myProjectsData?.items ?? []
  const activities = activitiesData?.items ?? []
  const groups = useMemo(() => groupByDate(activities), [activities])

  const totalMinutes = useMemo(() =>
    activities.reduce((sum, a) => sum + calcElapsedMinutes(a.startedAt, a.endedAt), 0),
    [activities]
  )
  const totalHours = Math.floor(totalMinutes / 60)
  const totalMins = totalMinutes % 60
  const totalDisplay = totalHours > 0 ? `${totalHours}時間${totalMins}分` : `${totalMins}分`

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>稼働</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="font-bold text-lg">稼働</h1>

      <div className="flex items-center gap-3">
        <Label>プロジェクト</Label>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {myProjects.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={goToPrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-32 text-center">{formatMonth(currentMonth)}</span>
        <Button variant="outline" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : activities.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            稼働がありません
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {isAdmin && <TableHead>ユーザー</TableHead>}
              <TableHead>プロジェクト</TableHead>
              <TableHead>開始</TableHead>
              <TableHead>終了</TableHead>
              <TableHead>経過時間</TableHead>
              <TableHead>メモ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map(group => (
              <>
                <TableRow key={`date-${group.date}`} className="bg-muted hover:bg-muted">
                  <TableCell colSpan={colCount} className="font-medium text-xs text-muted-foreground py-2">
                    {group.date}
                  </TableCell>
                </TableRow>
                {group.activities.map(activity => (
                  <TableRow
                    key={activity.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setEditingActivity(activity)}
                  >
                    {isAdmin && <TableCell>{activity.userName ?? '-'}</TableCell>}
                    <TableCell>{activity.projectName ?? '-'}</TableCell>
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
              </>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={colCount - 2} className="text-right font-medium">合計</TableCell>
              <TableCell className="font-medium">{totalDisplay}</TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
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
