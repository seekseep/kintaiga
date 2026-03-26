import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'

type Activity = {
  id: string
  type: string
  startedAt: string
  endedAt: string | null
  note: string | null
}

export function DashboardPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Activity[]>('/activities')
      .then(setActivities)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <Button asChild>
          <Link to="/activities/new">
            <Plus className="mr-2 h-4 w-4" />
            新規アクティビティ
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : activities.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            アクティビティがありません
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activities.map(activity => (
            <Link key={activity.id} to={`/activities/${activity.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{activity.type}</Badge>
                    <CardTitle className="text-sm font-normal text-muted-foreground">
                      {new Date(activity.startedAt).toLocaleString('ja-JP')}
                    </CardTitle>
                  </div>
                </CardHeader>
                {activity.note && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{activity.note}</p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
