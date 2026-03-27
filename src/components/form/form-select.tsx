'use client'

import { useField, useFormikContext } from 'formik'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type FormSelectProps = {
  name: string
  label?: string
  placeholder?: string
  options: { value: string; label: string }[]
}

export function FormSelect({ name, label, placeholder, options }: FormSelectProps) {
  const [field, meta] = useField(name)
  const { setFieldValue, setFieldTouched } = useFormikContext()
  const showError = meta.touched && meta.error

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <Select
        value={field.value}
        onValueChange={(value) => {
          setFieldValue(name, value)
          setFieldTouched(name, true, false)
        }}
      >
        <SelectTrigger aria-invalid={showError ? true : undefined}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showError && (
        <p className="text-sm text-destructive">{meta.error}</p>
      )}
    </div>
  )
}
