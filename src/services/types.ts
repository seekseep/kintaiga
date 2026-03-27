import type { db } from '@/lib/api-server/db'
import type { Role } from '@/schemas/_helpers'

export type Database = typeof db
export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0]
export type DbOrTx = Database | Transaction

export type Executor = { id: string; role: Role }
