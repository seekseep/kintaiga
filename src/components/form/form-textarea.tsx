'use client'

import { useField } from 'formik'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

type FormTextareaProps = Omit<React.ComponentProps<typeof Textarea>, 'name' | 'value' | 'onChange' | 'onBlur'> & {
  name: string
  label?: string
}

export function FormTextarea({ name, label, ...props }: FormTextareaProps) {
  const [field, meta] = useField(name)
  const showError = meta.touched && meta.error

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <Textarea
        id={name}
        {...field}
        {...props}
        aria-invalid={showError ? true : undefined}
      />
      {showError && (
        <p className="text-sm text-destructive">{meta.error}</p>
      )}
    </div>
  )
}
