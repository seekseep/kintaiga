'use client'

import { Button } from '@/components/ui/button'

export type ProjectFilter = 'joined' | 'all'

type Props = {
  filter: ProjectFilter
  onFilterChange: (filter: ProjectFilter) => void
}

export function ProjectFilterTabs({ filter, onFilterChange }: Props) {
  return (
    <div className="flex gap-2">
      <Button
        variant={filter === 'joined' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('joined')}
      >
        参加中
      </Button>
      <Button
        variant={filter === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('all')}
      >
        すべて
      </Button>
    </div>
  )
}
