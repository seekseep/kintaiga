/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from '@tanstack/react-start'

export function defineServerFn<TInput, TOutput>(
  handler: (input: TInput) => Promise<TOutput>,
): (input: TInput) => Promise<TOutput> {
  const serverFn = createServerFn({ method: 'POST' })
    .inputValidator((data: any) => data as TInput)
    .handler(async ({ data }: any) => (await handler(data as TInput)) as any)
  return (input: TInput) => serverFn({ data: input } as any) as Promise<TOutput>
}

export function defineServerFnNoArgs<TOutput>(
  handler: () => Promise<TOutput>,
): () => Promise<TOutput> {
  const serverFn = createServerFn({ method: 'GET' }).handler(handler as any)
  return () => serverFn() as Promise<TOutput>
}
