import { HttpError } from '@/lib/api-server/errors'

function handleError(err: unknown): Response {
  if (err instanceof HttpError) {
    return err.toResponse()
  }
  console.error(err)
  return Response.json({ error: 'Internal server error' }, { status: 500 })
}

export function withErrorHandler<T extends (...args: never[]) => Promise<Response>>(handler: T): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args)
    } catch (err) {
      return handleError(err)
    }
  }) as T
}
