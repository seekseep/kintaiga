import type { OrganizationExecutor } from '@/services/types'
import { getOrganizationExecutor } from './auth'

export function withOrganization<TArgs extends unknown[], TResult>(
  handler: (executor: OrganizationExecutor, ...args: TArgs) => Promise<TResult>,
): (organizationName: string, ...args: TArgs) => Promise<TResult> {
  return async (organizationName: string, ...args: TArgs) => {
    const executor = await getOrganizationExecutor(organizationName)
    return handler(executor, ...args)
  }
}
