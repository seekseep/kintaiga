import type { db } from '@/lib/api-server/db'
import type { AuthUser } from '@/lib/api-server/auth'

export type Database = typeof db
export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0]
export type DbOrTx = Database | Transaction

export type Executor = { type: 'user'; user: AuthUser }
