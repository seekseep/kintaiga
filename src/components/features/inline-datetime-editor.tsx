'use client'

import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/datetime-picker'

type Props = {
  value: string | null
  onSave: (iso: string) => Promise<void>
  allowNull?: boolean
  nullLabel?: string
  minuteStep?: number
  roundingDirection?: 'ceil' | 'floor'
}

export function InlineDateTimeEditor({
  value,
  onSave,
  allowNull = false,
  nullLabel = '進行中',
  minuteStep = 15,
  roundingDirection = 'ceil',
}: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [localValue, setLocalValue] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  )
  const originalValue = value

  const handleClick = useCallback(() => {
    if (isSaving) return
    setLocalValue(value ? new Date(value) : undefined)
    setIsEditing(true)
  }, [value, isSaving])

  const handleChange = useCallback((date: Date | undefined) => {
    setLocalValue(date)
  }, [])

  const handleOpenChange = useCallback(async (open: boolean) => {
    if (open) return
    // Popover closed — save if value changed
    setIsEditing(false)
    const newIso = localValue?.toISOString() ?? null
    if (newIso === originalValue) return
    if (!newIso && !allowNull) return

    setIsSaving(true)
    try {
      await onSave(newIso!)
    } catch {
      toast.error('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }, [localValue, originalValue, allowNull, onSave])

  if (isSaving) {
    return (
      <div className="w-52 h-9 flex items-center">
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
        </span>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="w-52 h-9 flex items-center" onClick={(e) => e.stopPropagation()}>
        <DateTimePicker
          value={localValue}
          onChange={handleChange}
          onOpenChange={handleOpenChange}
          defaultOpen
          minuteStep={minuteStep}
          roundingDirection={roundingDirection}
        />
      </div>
    )
  }

  return (
    <div className="w-52 h-9 flex items-center cursor-pointer" onClick={handleClick}>
      <Button
        variant="outline"
        className="w-full justify-start text-left font-normal h-9 px-4"
      >
        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
        {value
          ? format(new Date(value), 'yyyy/MM/dd(E) HH:mm', { locale: ja })
          : <Badge variant="default">{nullLabel}</Badge>
        }
      </Button>
    </div>
  )
}
