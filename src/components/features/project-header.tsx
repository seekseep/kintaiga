'use client'

import Link from 'next/link'
import { Settings } from 'lucide-react'

type Project = {
  name: string
  description: string | null
}

type Props = {
  project: Project
  projectId: string
  basePath: string
  editable: boolean
}

export function ProjectHeader({ project, basePath, editable }: Props) {
  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1 min-w-0 flex-1">
        <h1 className="font-bold text-lg">{project.name}</h1>
        <p className="text-sm text-muted-foreground">
          {project.description || '説明なし'}
        </p>
      </div>
      {editable && (
        <Link
          href={`${basePath}/settings`}
          className="ml-4 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="h-5 w-5" />
        </Link>
      )}
    </div>
  )
}
