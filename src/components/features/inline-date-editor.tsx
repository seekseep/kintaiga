'use client'

import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type Props = {
  value: string | null
  onSave: (iso: string) => Promise<void>
  allowNull?: boolean
  nullLabel?: string
}

export function InlineDateEditor({
  value,
  onSave,
  allowNull = false,
  nullLabel = '進行中',
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

  const handleSelect = useCallback(async (date: Date | undefined) => {
    setLocalValue(date)
    setIsEditing(false)

    const newIso = date?.toISOString() ?? null
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
  }, [originalValue, allowNull, onSave])

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setIsEditing(false)
    }
  }, [])

  if (isSaving) {
    return (
      <div className="w-40 h-9 flex items-center">
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
        </span>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="w-40 h-9 flex items-center" onClick={(e) => e.stopPropagation()}>
        <Popover defaultOpen onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal h-9 px-4"
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
              {localValue
                ? format(localValue, 'yyyy/MM/dd', { locale: ja })
                : <Badge variant="default">{nullLabel}</Badge>
              }
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={localValue}
              onSelect={handleSelect}
              locale={ja}
            />
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  return (
    <div className="w-40 h-9 flex items-center cursor-pointer" onClick={handleClick}>
      <Button
        variant="outline"
        className="w-full justify-start text-left font-normal h-9 px-4"
      >
        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
        {value
          ? format(new Date(value), 'yyyy/MM/dd', { locale: ja })
          : <Badge variant="default">{nullLabel}</Badge>
        }
      </Button>
    </div>
  )
}
