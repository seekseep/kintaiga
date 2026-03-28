import type { db } from '@/lib/api-server/db'
import type { Role, OrganizationRole, Plan } from '@/schemas/_helpers'

export type Database = typeof db
export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0]
export type DbOrTx = Database | Transaction

export type UserExecutor = {
  type: 'user'
  user: { id: string; role: Role }
}

export type OrganizationExecutor = {
  type: 'organization'
  user: { id: string; role: Role }
  organization: { id: string; role: OrganizationRole; plan: Plan }
}

export type SystemExecutor = {
  type: 'system'
}

export type Executor = UserExecutor | OrganizationExecutor | SystemExecutor
