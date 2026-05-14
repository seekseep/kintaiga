import type { db } from '@/lib/db'
import type { Role } from '@/schemas/role'
import type { OrganizationRole } from '@/schemas/organization-role'

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
  organization: { id: string; role: OrganizationRole }
}

export type SystemExecutor = {
  type: 'system'
}

export type Executor = UserExecutor | OrganizationExecutor | SystemExecutor

export type AuthorizedExecutor = UserExecutor | OrganizationExecutor
