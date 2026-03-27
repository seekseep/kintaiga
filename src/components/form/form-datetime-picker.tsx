'use client'

import { useField } from 'formik'
import { Label } from '@/components/ui/label'
import { DateTimePicker } from '@/components/ui/datetime-picker'

type FormDateTimePickerProps = {
  name: string
  label?: string
  disabled?: boolean
  placeholder?: string
  minuteStep?: number
}

function toLocalDatetime(date: Date) {
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

function fromLocalDatetime(value: string): Date | undefined {
  if (!value) return undefined
  return new Date(value)
}

export function FormDateTimePicker({ name, label, disabled, placeholder, minuteStep }: FormDateTimePickerProps) {
  const [field, meta, helpers] = useField(name)
  const showError = meta.touched && meta.error

  const dateValue = fromLocalDatetime(field.value)

  function handleChange(date: Date | undefined) {
    if (date) {
      helpers.setValue(toLocalDatetime(date))
    } else {
      helpers.setValue('')
    }
    helpers.setTouched(true)
  }

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <DateTimePicker
        value={dateValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        minuteStep={minuteStep}
      />
      {showError && (
        <p className="text-sm text-destructive">{meta.error}</p>
      )}
    </div>
  )
}
