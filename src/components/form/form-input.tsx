'use client'

import { useField } from 'formik'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FormInputProps = Omit<React.ComponentProps<typeof Input>, 'name' | 'value' | 'onChange' | 'onBlur'> & {
  name: string
  label?: string
}

export function FormInput({ name, label, ...props }: FormInputProps) {
  const [field, meta] = useField(name)
  const showError = meta.touched && meta.error

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <Input
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
