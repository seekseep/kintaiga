import { db } from '@/lib/api-server/db'
import { supabase } from '@/lib/api-server/supabase'
import { withAuth } from '@/lib/api-server/auth'
import { withErrorHandler } from '@/lib/api-server/errors'
import { parseBody } from '@/lib/api-server/parse'
import { CreateUserParametersSchema } from '@db/validation'
import { parsePagination, paginatedResponse } from '@/lib/api-server/pagination'
import { listUsers, createUser } from '@/services/users'

export const GET = withErrorHandler(withAuth(async (req, user) => {
  const url = new URL(req.url)
  const { limit, offset } = parsePagination(url)
  const { items, total } = await listUsers({ db }, { type: 'user', user }, { limit, offset })
  return Response.json(paginatedResponse(items, total, { limit, offset }))
}))

export const POST = withErrorHandler(withAuth(async (req, user) => {
  const parsed = await parseBody(req, CreateUserParametersSchema)
  const created = await createUser({ db, supabase }, { type: 'user', user }, parsed)
  return Response.json(created, { status: 201 })
}, { roles: ['admin'] }))
