'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Clock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatHours } from '@/domain/utils/time'

type Props = {
  value: number | null
  onSave: (minutes: number | null) => Promise<void>
  readOnly?: boolean
  nullLabel?: string
}

function minutesToHoursInput(minutes: number | null): string {
  if (minutes == null) return ''
  return String(minutes / 60)
}

export function InlineHoursEditor({
  value,
  onSave,
  readOnly = false,
  nullLabel = '未設定',
}: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [localValue, setLocalValue] = useState(minutesToHoursInput(value))
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  const handleClick = useCallback(() => {
    if (isSaving || readOnly) return
    setLocalValue(minutesToHoursInput(value))
    setIsEditing(true)
  }, [value, isSaving, readOnly])

  const save = useCallback(async () => {
    const trimmed = localValue.trim()
    let newMinutes: number | null
    if (trimmed === '') {
      newMinutes = null
    } else {
      const hours = Number(trimmed)
      if (!Number.isFinite(hours) || hours < 0) {
        toast.error('0以上の数値を入力してください')
        setLocalValue(minutesToHoursInput(value))
        setIsEditing(false)
        return
      }
      newMinutes = Math.round(hours * 60)
    }
    setIsEditing(false)
    if (newMinutes === value) return

    setIsSaving(true)
    try {
      await onSave(newMinutes)
    } catch {
      toast.error('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }, [localValue, value, onSave])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setLocalValue(minutesToHoursInput(value))
      setIsEditing(false)
    }
  }, [value])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    save()
  }, [save])

  const displayHours = value != null ? `${formatHours(value)}時間` : null

  if (isSaving) {
    return (
      <div className="w-32 h-9 flex items-center">
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
        </span>
      </div>
    )
  }

  if (isEditing) {
    return (
      <form ref={formRef} className="w-32" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <Input
          ref={inputRef}
          type="number"
          step="0.1"
          min="0"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={() => formRef.current?.requestSubmit()}
          onKeyDown={handleKeyDown}
          placeholder="時間"
          className="h-9"
        />
      </form>
    )
  }

  if (readOnly) {
    return (
      <div className="w-32 h-9 flex items-center px-4 text-sm">
        <Clock className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
        {displayHours ?? <Badge variant="default">{nullLabel}</Badge>}
      </div>
    )
  }

  return (
    <div className="w-32 h-9 flex items-center cursor-pointer" onClick={handleClick}>
      <Button
        variant="outline"
        className="w-full justify-start text-left font-normal h-9 px-4"
      >
        <Clock className="mr-2 h-4 w-4 shrink-0" />
        {displayHours ?? <Badge variant="default">{nullLabel}</Badge>}
      </Button>
    </div>
  )
}
