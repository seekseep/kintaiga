'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type ProjectFilter = 'joined' | 'all'

type Props = {
  filter: ProjectFilter
  onFilterChange: (filter: ProjectFilter) => void
}

export function ProjectFilterTabs({ filter, onFilterChange }: Props) {
  return (
    <Tabs value={filter} onValueChange={(value) => onFilterChange(value as ProjectFilter)}>
      <TabsList>
        <TabsTrigger value="joined">参加中</TabsTrigger>
        <TabsTrigger value="all">すべて</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
