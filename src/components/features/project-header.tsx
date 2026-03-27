'use client'

import Link from 'next/link'
import { Pencil } from 'lucide-react'

type Project = {
  name: string
  description: string | null
}

type Props = {
  project: Project
  basePath: string
  editable: boolean
}

export function ProjectHeader({ project, basePath, editable }: Props) {
  return (
    <div className="space-y-1">
      {editable ? (
        <Link href={`${basePath}/name`} className="group flex items-center gap-2">
          <h1 className="font-bold text-lg my-0">{project.name}</h1>
          <Pencil className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      ) : (
        <h1 className="font-bold text-lg">{project.name}</h1>
      )}

      {editable ? (
        <Link href={`${basePath}/description`} className="group flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {project.description || '説明なし'}
          </p>
          <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      ) : (
        project.description && (
          <p className="text-sm text-muted-foreground">{project.description}</p>
        )
      )}
    </div>
  )
}
