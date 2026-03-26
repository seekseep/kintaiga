import 'dotenv/config'
import { program } from 'commander'
import { select } from '@inquirer/prompts'
import { drizzle } from 'drizzle-orm/postgres-js'
import { eq, or } from 'drizzle-orm'
import postgres from 'postgres'
import { users, roleEnum } from '../db/schema'
import { createClient } from '@supabase/supabase-js'

const roles = roleEnum.enumValues

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
  if (identifier) {
    // Try to find by email (via Supabase Auth) or by ID
    const authUsers = await getAuthUsers()
    const authUser = authUsers.find((u) => u.email === identifier)
    const userId = authUser?.id ?? identifier

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))

    if (!user) {
      console.error(`User not found: ${identifier}`)
      process.exit(1)
    }

    const email = authUser?.email ?? authUsers.find((u) => u.id === user.id)?.email
    return { ...user, email }
  }

  // Interactive: list all users
  const allUsers = await db.select().from(users)
  const authUsers = await getAuthUsers()

  if (allUsers.length === 0) {
    console.error('No users found')
    process.exit(1)
  }

  const choices = allUsers.map((u) => {
    const email = authUsers.find((a) => a.id === u.id)?.email ?? 'unknown'
    return {
      name: `${u.name} (${email}) [${u.role}]`,
      value: { ...u, email },
    }
  })

  return await select({
    message: 'Select a user:',
    choices,
  })
}

async function resolveRole(role?: string, currentRole?: string) {
  if (role) {
    if (!roles.includes(role as typeof roles[number])) {
      console.error(`Invalid role: ${role}. Valid roles: ${roles.join(', ')}`)
      process.exit(1)
    }
    return role as typeof roles[number]
  }

  return await select({
    message: 'Select new role:',
    choices: roles.map((r) => ({
      name: r === currentRole ? `${r} (current)` : r,
      value: r,
    })),
  })
}

program
  .option('-u, --user <emailOrId>', 'User email or ID')
  .option('-r, --role <role>', `New role (${roles.join(', ')})`)
  .action(async (options) => {
    try {
      const user = await resolveUser(options.user)
      console.log(`\nSelected user: ${user.name} (${user.email}) [current role: ${user.role}]`)

      const newRole = await resolveRole(options.role, user.role)

      if (newRole === user.role) {
        console.log('Role is already set. No changes made.')
        process.exit(0)
      }

      await db
        .update(users)
        .set({ role: newRole, updatedAt: new Date() })
        .where(eq(users.id, user.id))

      console.log(`Updated role: ${user.role} -> ${newRole}`)
    } catch (error) {
      console.error('Error:', error)
      process.exit(1)
    } finally {
      await client.end()
    }
  })

program.parse()
