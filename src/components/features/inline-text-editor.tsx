'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Props = {
  value: string | null
  onSave: (text: string) => Promise<void>
  placeholder?: string
}

export function InlineTextEditor({
  value,
  onSave,
  placeholder = 'なし',
}: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [localValue, setLocalValue] = useState(value ?? '')
  const inputRef = useRef<HTMLInputElement>(null)
  const originalValue = value ?? ''

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
    }
  }, [isEditing])

  const handleClick = useCallback(() => {
    if (isSaving) return
    setLocalValue(value ?? '')
    setIsEditing(true)
  }, [value, isSaving])

  const save = useCallback(async () => {
    setIsEditing(false)
    if (localValue === originalValue) return

    setIsSaving(true)
    try {
      await onSave(localValue)
    } catch {
      toast.error('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }, [localValue, originalValue, onSave])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      save()
    } else if (e.key === 'Escape') {
      setLocalValue(originalValue)
      setIsEditing(false)
    }
  }, [save, originalValue])

  if (isSaving) {
    return (
      <div className="min-w-32">
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
        </span>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="min-w-32" onClick={(e) => e.stopPropagation()}>
        <Input
          ref={inputRef}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={save}
          onKeyDown={handleKeyDown}
          className="h-8"
        />
      </div>
    )
  }

  return (
    <div className="min-w-32" onClick={handleClick}>
      <Button
        variant="outline"
        className="w-full justify-start text-left font-normal h-9 px-4"
      >
        <span className={value ? undefined : 'text-muted-foreground'}>{value || placeholder}</span>
      </Button>
    </div>
  )
}
