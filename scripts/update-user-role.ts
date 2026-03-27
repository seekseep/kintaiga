import 'dotenv/config'
import { program } from 'commander'
import { select } from '@inquirer/prompts'
import { drizzle } from 'drizzle-orm/postgres-js'
import { eq } from 'drizzle-orm'
import postgres from 'postgres'
import { createClient } from '@supabase/supabase-js'
import { users } from '../db/schema'

const ROLES = ['admin', 'general'] as const
type Role = typeof ROLES[number]

const client = postgres(process.env.DATABASE_URL!, { prepare: false })
const db = drizzle(client)

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function getAuthUsers() {
  const { data, error } = await supabase.auth.admin.listUsers()
  if (error) throw error
  return data.users
}

async function resolveUser(identifier?: string) {
  const authUsers = await getAuthUsers()

  if (identifier) {
    const user = authUsers.find((u) => u.email === identifier || u.id === identifier)
    if (!user) {
      console.error(`User not found: ${identifier}`)
      process.exit(1)
    }
    return user
  }

  if (authUsers.length === 0) {
    console.error('No users found')
    process.exit(1)
  }

  const choices = authUsers.map((u) => ({
    name: `${u.email} [${(u.app_metadata?.role as string) ?? 'no role'}]`,
    value: u,
  }))

  return await select({ message: 'Select a user:', choices })
}

async function resolveRole(role?: string, currentRole?: string) {
  if (role) {
    if (!ROLES.includes(role as Role)) {
      console.error(`Invalid role: ${role}. Valid roles: ${ROLES.join(', ')}`)
      process.exit(1)
    }
    return role as Role
  }

  return await select({
    message: 'Select new role:',
    choices: ROLES.map((r) => ({
      name: r === currentRole ? `${r} (current)` : r,
      value: r,
    })),
  })
}

program
  .option('-u, --user <emailOrId>', 'User email or ID')
  .option('-r, --role <role>', `New role (${ROLES.join(', ')})`)
  .action(async (options) => {
    try {
      const user = await resolveUser(options.user)
      const currentRole = (user.app_metadata?.role as string) ?? 'none'
      console.log(`\nSelected user: ${user.email} [current role: ${currentRole}]`)

      const newRole = await resolveRole(options.role, currentRole)

      if (newRole === currentRole) {
        console.log('Role is already set. No changes made.')
        process.exit(0)
      }

      // app_metadata を更新（信頼源）
      await supabase.auth.admin.updateUserById(user.id, {
        app_metadata: { role: newRole },
      })

      // DB キャッシュも更新
      await db.update(users).set({ role: newRole, updatedAt: new Date() }).where(eq(users.id, user.id))

      console.log(`Updated role: ${currentRole} -> ${newRole}`)
    } catch (error) {
      console.error('Error:', error)
      process.exit(1)
    } finally {
      await client.end()
    }
  })

program.parse()
