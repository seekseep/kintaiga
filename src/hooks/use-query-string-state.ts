'use client'

import { useCallback } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'

export type ParameterDefinition<T> = {
  key: string
  defaultValue: T
  serialize: (value: T) => string | undefined
  deserialize: (raw: string | null) => T
}

export function useQueryStringState<T>(
  def: ParameterDefinition<T>,
): [T, (value: T) => void] {
  const navigate = useNavigate()
  const { pathname, searchStr } = useLocation({
    select: (loc) => ({ pathname: loc.pathname, searchStr: loc.searchStr ?? '' }),
  })

  const searchParams = new URLSearchParams(searchStr)
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
      navigate({
        to: pathname + (qs ? `?${qs}` : ''),
        replace: true,
        resetScroll: false,
      })
    },
    [def, navigate, pathname],
  )

  return [value, setValue]
}
