'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type ProjectFilter = 'joined' | 'all'

type Props = {
  filter: ProjectFilter
  onFilterChange: (filter: ProjectFilter) => void
  joinedCount?: number
  allCount?: number
}

export function ProjectFilterTabs({ filter, onFilterChange, joinedCount, allCount }: Props) {
  return (
    <Tabs value={filter} onValueChange={(value) => onFilterChange(value as ProjectFilter)}>
      <TabsList>
        <TabsTrigger value="joined">
          参加中{joinedCount != null && ` (${joinedCount})`}
        </TabsTrigger>
        <TabsTrigger value="all">
          すべて{allCount != null && ` (${allCount})`}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
