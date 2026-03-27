'use client'

import { useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export type ParamDefinition<T> = {
  key: string
  defaultValue: T
  serialize: (value: T) => string | undefined
  deserialize: (raw: string | null) => T
}

export function useQueryStringState<T>(
  def: ParamDefinition<T>
): [T, (value: T) => void] {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const value = def.deserialize(searchParams.get(def.key))

  const setValue = useCallback(
    (newValue: T) => {
      const params = new URLSearchParams(window.location.search)
      const serialized = def.serialize(newValue)
      if (serialized === undefined) {
        params.delete(def.key)
      } else {
        params.set(def.key, serialized)
      }
      const qs = params.toString()
      router.replace(pathname + (qs ? `?${qs}` : ''), { scroll: false })
    },
    [def, router, pathname]
  )

  return [value, setValue]
}
