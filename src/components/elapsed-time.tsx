'use client'

import { useState, useEffect } from 'react'

function formatElapsedMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) {
    return `${h}時間${m}分`
  }
  return `${m}分`
}

export function calcElapsedMinutes(startedAt: string, endedAt: string | null): number {
  const start = new Date(startedAt).getTime()
  const end = endedAt ? new Date(endedAt).getTime() : Date.now()
  return Math.floor((end - start) / 60000)
}

export function formatElapsed(startedAt: string, endedAt: string | null): string {
  return formatElapsedMinutes(calcElapsedMinutes(startedAt, endedAt))
}

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
