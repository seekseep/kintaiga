'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { CalendarIcon, Minus, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type DateTimePickerProps = {
  value?: Date
  onChange?: (date: Date | undefined) => void
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  placeholder?: string
  minuteStep?: number
  roundingDirection?: 'ceil' | 'floor'
  defaultOpen?: boolean
}

function roundTime(date: Date, interval: number, direction: 'ceil' | 'floor'): Date {
  const ms = interval * 60000
  const time = date.getTime()
  const rounded = direction === 'ceil'
    ? Math.ceil(time / ms) * ms
    : Math.floor(time / ms) * ms
  return new Date(rounded)
}

export function DateTimePicker({
  value,
  onChange,
  onOpenChange,
  disabled,
  placeholder = '日時を選択',
  minuteStep = 5,
  roundingDirection = 'ceil',
  defaultOpen = false,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(defaultOpen)

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    onOpenChange?.(nextOpen)
  }

  function handleDateSelect(day: Date | undefined) {
    if (!day) return
    const next = new Date(day)
    if (value) {
      next.setHours(value.getHours(), value.getMinutes(), 0, 0)
    } else {
      const now = new Date()
      next.setHours(now.getHours(), now.getMinutes(), 0, 0)
    }
    onChange?.(next)
  }

  function handleTimeStep(delta: number) {
    const base = value ? new Date(value) : new Date()
    base.setSeconds(0, 0)
    const direction = delta > 0 ? 'ceil' : 'floor'
    const rounded = roundTime(base, minuteStep, direction)
    // If already on a boundary, step by one interval
    if (rounded.getTime() === base.getTime()) {
      base.setMinutes(base.getMinutes() + delta)
      onChange?.(base)
    } else {
      onChange?.(rounded)
    }
  }

  function handleSetNow() {
    const rounded = roundTime(new Date(), minuteStep, roundingDirection)
    onChange?.(rounded)
  }

  const displayTime = value
    ? `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`
    : '--:--'

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value
            ? format(value, 'yyyy/MM/dd HH:mm', { locale: ja })
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          locale={ja}
          defaultMonth={value}
        />
        <div className="border-t px-3 py-2 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleTimeStep(-minuteStep)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-lg font-mono min-w-16 text-center">{displayTime}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleTimeStep(minuteStep)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={handleSetNow}
            >
              現在
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
