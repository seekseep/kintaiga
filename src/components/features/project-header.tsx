'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Pencil, Settings, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { useUpdateProject } from '@/hooks/api/projects'

type Project = {
  name: string
  description: string | null
}

type Props = {
  project: Project
  projectId: string
  basePath: string
  editable: boolean
}

function InlineField({
  value,
  onSave,
  placeholder,
  as: Tag = 'span',
  className,
  inputClassName,
}: {
  value: string
  onSave: (v: string) => Promise<void>
  placeholder: string
  as?: 'h1' | 'span'
  className?: string
  inputClassName?: string
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [local, setLocal] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const startEdit = useCallback(() => {
    if (saving) return
    setLocal(value)
    setEditing(true)
  }, [value, saving])

  const save = useCallback(async () => {
    setEditing(false)
    if (local === value) return
    setSaving(true)
    try {
      await onSave(local)
    } catch {
      toast.error('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }, [local, value, onSave])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      save()
    } else if (e.key === 'Escape') {
      setLocal(value)
      setEditing(false)
    }
  }, [save, value])

  if (saving) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
  }

  if (editing) {
    return (
      <Input
        ref={inputRef}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        className={inputClassName}
      />
    )
  }

  return (
    <button type="button" onClick={startEdit} className="group flex items-center gap-2 text-left">
      <Tag className={className}>
        {value || <span className="text-muted-foreground">{placeholder}</span>}
      </Tag>
      <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  )
}

export function ProjectHeader({ project, projectId, basePath, editable }: Props) {
  const mutation = useUpdateProject()

  const saveName = useCallback(async (name: string) => {
    if (!name.trim()) {
      toast.error('名前は必須です')
      return
    }
    await mutation.mutateAsync({ id: projectId, body: { name } })
  }, [mutation, projectId])

  const saveDescription = useCallback(async (description: string) => {
    await mutation.mutateAsync({ id: projectId, body: { description: description || null } })
  }, [mutation, projectId])

  return (
    <div className="space-y-1">
      {editable ? (
        <InlineField
          value={project.name}
          onSave={saveName}
          placeholder="名前なし"
          as="h1"
          className="font-bold text-lg my-0"
          inputClassName="h-8 font-bold text-lg"
        />
      ) : (
        <h1 className="font-bold text-lg">{project.name}</h1>
      )}

      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {editable ? (
            <InlineField
              value={project.description ?? ''}
              onSave={saveDescription}
              placeholder="説明なし"
              className="text-sm text-muted-foreground truncate"
              inputClassName="h-7 text-sm"
            />
          ) : (
            project.description && (
              <p className="text-sm text-muted-foreground">{project.description}</p>
            )
          )}
        </div>
        {editable && (
          <Link
            href={`${basePath}/configurations`}
            className="ml-4 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="h-5 w-5" />
          </Link>
        )}
      </div>
    </div>
  )
}
