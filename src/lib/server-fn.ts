import { createServerFn } from '@tanstack/react-start'

export function defineServerFn<TInput, TOutput>(
  handler: (input: TInput) => Promise<TOutput>,
): (input: TInput) => Promise<TOutput> {
  const serverFn = createServerFn({ method: 'POST' })
    .inputValidator((data: TInput) => data)
    .handler(async ({ data }) => handler(data))
  return (input: TInput) => serverFn({ data: input })
}

export function defineServerFnNoArgs<TOutput>(
  handler: () => Promise<TOutput>,
): () => Promise<TOutput> {
  const serverFn = createServerFn({ method: 'GET' }).handler(handler)
  return () => serverFn()
}
