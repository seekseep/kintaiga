import { configurations } from '@db/schema'
import type { DbOrTx, Executor } from '../../types'

export async function getConfiguration(
  dependencies: { db: DbOrTx },
  _executor: Executor,
) {
  const { db } = dependencies
  const configRows = await db.select().from(configurations).limit(1)
  let config = configRows[0]
  if (!config) {
    const [created] = await db.insert(configurations).values({}).returning()
    config = created
  }
  return config
}
