'use client'

import Link from 'next/link'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { ActivityControl } from '@/components/activity-control'
import type { UserProjectStatement } from '@/schemas'

type Props = {
  statements: UserProjectStatement[]
  currentUserId: string
  emptyMessage: string
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {statements.map(statement => (
        <Card key={statement.id}>
          <CardContent className="pt-4 pb-3 space-y-2">
            <Link href={`/projects/${statement.id}`} className="hover:underline">
              <CardTitle className="text-base">{statement.name}</CardTitle>
            </Link>
            {statement.membershipStatus === 'joined' ? (
              <ActivityControl
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
      ))}
    </div>
  )
}
