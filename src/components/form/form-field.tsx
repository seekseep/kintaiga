'use client'

import { useField, type FieldHelperProps, type FieldInputProps, type FieldMetaProps } from 'formik'
import { Label } from '@/components/ui/label'

type FormFieldProps<V = string> = {
  name: string
  label?: string
  children: (props: {
    field: FieldInputProps<V>
    meta: FieldMetaProps<V>
    helpers: FieldHelperProps<V>
  }) => React.ReactNode
}

export function FormField<V = string>({ name, label, children }: FormFieldProps<V>) {
  const [field, meta, helpers] = useField<V>(name)
  const showError = meta.touched && meta.error

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      {children({ field, meta, helpers })}
      {showError && (
        <p className="text-sm text-destructive">{meta.error}</p>
      )}
    </div>
  )
}
