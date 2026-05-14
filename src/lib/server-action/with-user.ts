import type { UserExecutor } from '@/services/types'
import { getUserExecutor } from './auth'

export function withUser<TArgs extends unknown[], TResult>(
  handler: (executor: UserExecutor, ...args: TArgs) => Promise<TResult>,
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs) => {
    const executor = await getUserExecutor()
    return handler(executor, ...args)
  }
}
