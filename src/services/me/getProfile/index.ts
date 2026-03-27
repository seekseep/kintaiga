import { NotFoundError } from '@/lib/api-server/errors'
import type { Executor } from '../../types'

export function getProfile(
  executor: Executor | null,
) {
  if (!executor) throw new NotFoundError()
  return executor.user
}
