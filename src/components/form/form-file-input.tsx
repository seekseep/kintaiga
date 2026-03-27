'use client'

import { useRef } from 'react'
import { useField, useFormikContext } from 'formik'
import { Label } from '@/components/ui/label'

type FormFileInputProps = {
  name: string
  label?: string
  accept?: string
}

export function FormFileInput({ name, label, accept }: FormFileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [, meta] = useField(name)
  const { setFieldValue, setFieldTouched } = useFormikContext()
  const showError = meta.touched && meta.error

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setFieldValue(name, reader.result as string)
      setFieldTouched(name, true, false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <input
        ref={inputRef}
        id={name}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      {showError && (
        <p className="text-sm text-destructive">{meta.error}</p>
      )}
    </div>
  )
}
