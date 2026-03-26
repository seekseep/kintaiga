import type { z } from 'zod/v4'
import { HttpError } from '@api/_lib/errors.ts'

export class ValidationError extends HttpError {
  details: unknown[]

  constructor(details: unknown[]) {
    super(400, 'Validation failed')
    this.details = details
  }

  toResponse(): Response {
    return Response.json({ error: this.message, details: this.details }, { status: 400 })
  }
}

export async function parseBody<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
  const body = await req.json()
  const result = schema.safeParse(body)
  if (!result.success) {
    throw new ValidationError(result.error.issues)
  }
  return result.data
}
