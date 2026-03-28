'use client'

import { useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export type ParameterDefinition<T> = {
  key: string
  defaultValue: T
  serialize: (value: T) => string | undefined
  deserialize: (raw: string | null) => T
}

export function useQueryStringState<T>(
  def: ParameterDefinition<T>
): [T, (value: T) => void] {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const value = def.deserialize(searchParams.get(def.key))

  const setValue = useCallback(
    (newValue: T) => {
      const searchParameters = new URLSearchParams(window.location.search)
      const serialized = def.serialize(newValue)
      if (serialized === undefined) {
        searchParameters.delete(def.key)
      } else {
        searchParameters.set(def.key, serialized)
      }
      const qs = searchParameters.toString()
      router.replace(pathname + (qs ? `?${qs}` : ''), { scroll: false })
    },
    [def, router, pathname]
  )

  return [value, setValue]
}
