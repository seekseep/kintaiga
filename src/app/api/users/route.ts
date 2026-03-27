import { db } from '@/lib/api-server/db'
import { supabase } from '@/lib/api-server/supabase'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { getSearchParams } from '@/lib/api-server/search-params'
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@/constants'
import { listUsers, createUser } from '@/services/users'

export const GET = withErrorHandler(withAuth(async (req, executor) => {
  const params = getSearchParams(req, [
    { key: 'limit', type: 'number', defaultValue: DEFAULT_LIMIT },
    { key: 'offset', type: 'number', defaultValue: DEFAULT_OFFSET },
  ] as const)
  const result = await listUsers({ db }, executor, params)
  return Response.json(result)
}))

export const POST = withErrorHandler(withAuth(async (req, executor) => {
  const body = await req.json()
  const created = await createUser({ db, supabase }, executor, body)
  return Response.json(created, { status: 201 })
}))
