'use client'

import { startOfMonth, endOfMonth, format, parse, isSameDay } from 'date-fns'
import { useQueryStringState } from './use-query-string-state'

export function useActivityFiltersSearchParams() {
  const [userFilter, setUserFilter] = useQueryStringState<string>({
    key: 'user',
    defaultValue: 'all',
    serialize: (value) => (value === 'all' ? undefined : value),
    deserialize: (raw) => raw ?? 'all',
  })

  const [projectFilter, setProjectFilter] = useQueryStringState<string>({
    key: 'project',
    defaultValue: 'all',
    serialize: (value) => (value === 'all' ? undefined : value),
    deserialize: (raw) => raw ?? 'all',
  })

  const [startDate, setStartDate] = useQueryStringState<Date | undefined>({
    key: 'start',
    defaultValue: startOfMonth(new Date()),
    serialize: (value) => {
      if (!value) return undefined
      if (isSameDay(value, startOfMonth(new Date()))) return undefined
      return format(value, 'yyyy-MM-dd')
    },
    deserialize: (raw) => {
      if (!raw) return startOfMonth(new Date())
      const parsed = parse(raw, 'yyyy-MM-dd', new Date())
      return isNaN(parsed.getTime()) ? startOfMonth(new Date()) : parsed
    },
  })

  const [endDate, setEndDate] = useQueryStringState<Date | undefined>({
    key: 'end',
    defaultValue: endOfMonth(new Date()),
    serialize: (value) => {
      if (!value) return undefined
      if (isSameDay(value, endOfMonth(new Date()))) return undefined
      return format(value, 'yyyy-MM-dd')
    },
    deserialize: (raw) => {
      if (!raw) return endOfMonth(new Date())
      const parsed = parse(raw, 'yyyy-MM-dd', new Date())
      return isNaN(parsed.getTime()) ? endOfMonth(new Date()) : parsed
    },
  })

  return {
    userFilter,
    setUserFilter,
    projectFilter,
    setProjectFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  }
}
