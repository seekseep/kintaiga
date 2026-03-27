'use client'

import { useQueryStringState } from './use-query-string-state'

export function useMonthOffsetSearchParam(): [number, (offset: number) => void] {
  return useQueryStringState<number>({
    key: 'month',
    defaultValue: 0,
    serialize: (value) => (value === 0 ? undefined : String(value)),
    deserialize: (raw) => {
      if (!raw) return 0
      const parsed = parseInt(raw, 10)
      return isNaN(parsed) ? 0 : parsed
    },
  })
}
