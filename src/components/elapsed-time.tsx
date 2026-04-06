'use client'

import { useState, useEffect } from 'react'
import { formatElapsed } from '@/domain/utils/time'

export { calcElapsedMinutes, formatElapsed } from '@/domain/utils/time'

export function ElapsedTime({ startedAt, endedAt }: { startedAt: string; endedAt: string | null }) {
  const [display, setDisplay] = useState(() => formatElapsed(startedAt, endedAt))

  useEffect(() => {
    if (endedAt) {
      setDisplay(formatElapsed(startedAt, endedAt))
      return
    }
    setDisplay(formatElapsed(startedAt, null))
    const id = setInterval(() => {
      setDisplay(formatElapsed(startedAt, null))
    }, 60000)
    return () => clearInterval(id)
  }, [startedAt, endedAt])

  return <>{display}</>
}
