'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getMyProjects } from '@/api/me'
import { getProjects } from '@/api/projects'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateProjectDialog } from '@/components/create-project-dialog'
import { ActivityControl } from '@/components/activity-control'
import { useAuth } from '@/hooks/use-auth'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Plus } from 'lucide-react'

type ProjectFilter = 'joined' | 'all'

export default function ProjectsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [filter, setFilter] = useState<ProjectFilter>('joined')
  const [createProjectOpen, setCreateProjectOpen] = useState(false)

  const { data: myProjectsData, isLoading: loadingProjects } = useQuery({
    queryKey: ['me', 'projects'],
    queryFn: () => getMyProjects(),
  })

  const { data: allProjectsData, isLoading: loadingAllProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
    enabled: isAdmin && filter === 'all',
  })

  const myProjects = myProjectsData?.items ?? []
  const allProjects = allProjectsData?.items ?? []

  const isLoading = loadingProjects || (isAdmin && filter === 'all' && loadingAllProjects)

  const projects = isAdmin && filter === 'all' ? allProjects : myProjects

  // 自分が所属しているプロジェクトのID集合
  const myProjectIds = new Set(myProjects.map(p => p.id))

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>プロジェクト</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-lg">プロジェクト</h1>
        {isAdmin && (
          <Button size="sm" onClick={() => setCreateProjectOpen(true)}>
            <Plus className="mr-1 h-3 w-3" />
            追加
          </Button>
        )}
      </div>

      {isAdmin && (
        <div className="flex gap-2">
          <Button
            variant={filter === 'joined' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('joined')}
          >
            参加している
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            すべて
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            {filter === 'all' ? 'プロジェクトはありません' : '所属しているプロジェクトはありません'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map(project => {
            const isMember = myProjectIds.has(project.id)
            return (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Link href={`/projects/${project.id}`} className="hover:underline">
                      <CardTitle className="text-base">{project.name}</CardTitle>
                    </Link>
                    {isMember && user ? (
                      <ActivityControl
                        userId={user.id}
                        projectId={project.id}
                        projectName={project.name}
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">参加していません</span>
                    )}
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      )}

      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
      />
    </div>
  )
}
