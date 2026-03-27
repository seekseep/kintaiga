import type { z } from 'zod/v4'
import type { FormikErrors } from 'formik'

export function zodValidate<T extends z.ZodType>(schema: T) {
  return async (values: z.input<T>): Promise<FormikErrors<z.input<T>>> => {
    const result = await schema.safeParseAsync(values)
    if (result.success) return {}
    const errors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const path = issue.path.join('.')
      if (!errors[path]) {
        errors[path] = issue.message
      }
    }
    return errors as FormikErrors<z.input<T>>
  }
}
