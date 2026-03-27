import { count } from 'drizzle-orm'
import { db } from '@/lib/api-server/db'
import { users } from '@db/schema'
import { withAuth } from '@/lib/api-server/auth'
import { parseBody } from '@/lib/api-server/parse'
import { CreateUserParametersSchema } from '@db/validation'
import { parsePagination, paginatedResponse } from '@/lib/api-server/pagination'
import { supabase } from '@/lib/api-server/supabase'
import { ConflictError, InternalError } from '@/lib/api-server/errors'

export const GET = withAuth(async (req, _user) => {
  const url = new URL(req.url)
  const { limit, offset } = parsePagination(url)

  const [items, [{ total }]] = await Promise.all([
    db.select().from(users).limit(limit).offset(offset),
    db.select({ total: count() }).from(users),
  ])

  return Response.json(paginatedResponse(items, total, { limit, offset }))
})

export const POST = withAuth(async (req) => {
  const { email, password, name, role } = await parseBody(req, CreateUserParametersSchema)

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    if (error.message.includes('already been registered')) {
      throw new ConflictError('このメールアドレスは既に登録されています')
    }
    throw new InternalError(error.message)
  }

  const [created] = await db.insert(users).values({
    id: data.user.id,
    name,
    role,
  }).returning()

  return Response.json(created, { status: 201 })
}, { roles: ['admin'] })
