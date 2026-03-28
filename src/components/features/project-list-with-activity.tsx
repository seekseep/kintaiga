'use client'

import { useRef, useCallback, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ActivityControl, type ActivityControlHandle } from '@/components/activity-control'
import { RefreshCw } from 'lucide-react'
import type { UserProjectStatement } from '@/schemas'

type Props = {
  statements: UserProjectStatement[]
  currentUserId: string
  emptyMessage: string
}

function ProjectCard({ statement, currentUserId }: { statement: UserProjectStatement; currentUserId: string }) {
  const { organizationName } = useParams<{ organizationName: string }>()
  const activityRef = useRef<ActivityControlHandle>(null)
  const [isFetching, setIsFetching] = useState(false)

  const handleRefetch = useCallback(() => {
    activityRef.current?.refetch()
    setIsFetching(true)
    setTimeout(() => setIsFetching(false), 1000)
  }, [])

  return (
    <Card>
      <CardContent className="pt-4 pb-3 space-y-2">
        <div className="flex items-center justify-between">
          <Link href={`/${organizationName}/projects/${statement.id}`} className="hover:underline">
            <CardTitle className="text-base">{statement.name}</CardTitle>
          </Link>
          {statement.membershipStatus === 'joined' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRefetch() }}
              disabled={isFetching}
            >
              <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
        {statement.membershipStatus === 'joined' ? (
          <ActivityControl
            ref={activityRef}
            userId={currentUserId}
            projectId={statement.id}
            projectName={statement.name}
          />
        ) : statement.membershipStatus === 'suspended' ? (
          <span className="text-sm text-muted-foreground">休止中</span>
        ) : (
          <span className="text-sm text-muted-foreground">未参加</span>
        )}
      </CardContent>
    </Card>
  )
}

export function ProjectListWithActivity({ statements, currentUserId, emptyMessage }: Props) {
  if (statements.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))' }}>
      {statements.map(statement => (
        <ProjectCard key={statement.id} statement={statement} currentUserId={currentUserId} />
      ))}
    </div>
  )
}
