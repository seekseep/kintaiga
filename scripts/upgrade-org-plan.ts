import 'dotenv/config'
import { program } from 'commander'
import { select } from '@inquirer/prompts'
import { drizzle } from 'drizzle-orm/postgres-js'
import { eq } from 'drizzle-orm'
import postgres from 'postgres'
import { organizations } from '../db/schema'

const PLANS = ['free', 'premium'] as const
type Plan = typeof PLANS[number]

const client = postgres(process.env.DATABASE_URL!, { prepare: false })
const db = drizzle(client)

async function resolveOrganization(identifier?: string) {
  if (identifier) {
    const [org] = await db.select().from(organizations).where(eq(organizations.name, identifier)).limit(1)
    if (!org) {
      console.error(`Organization not found: ${identifier}`)
      process.exit(1)
    }
    return org
  }

  const allOrgs = await db.select().from(organizations)
  if (allOrgs.length === 0) {
    console.error('No organizations found')
    process.exit(1)
  }

  return await select({
    message: '組織を選択:',
    choices: allOrgs.map((o) => ({
      name: `${o.name} [${o.plan}]`,
      value: o,
    })),
  })
}

async function resolvePlan(plan?: string, currentPlan?: string) {
  if (plan) {
    if (!PLANS.includes(plan as Plan)) {
      console.error(`Invalid plan: ${plan}. Valid plans: ${PLANS.join(', ')}`)
      process.exit(1)
    }
    return plan as Plan
  }

  return await select({
    message: '新しいプランを選択:',
    choices: PLANS.map((p) => ({
      name: p === currentPlan ? `${p} (current)` : p,
      value: p,
    })),
  })
}

program
  .option('-o, --org <name>', 'Organization name')
  .option('-p, --plan <plan>', `New plan (${PLANS.join(', ')})`)
  .action(async (options) => {
    try {
      const org = await resolveOrganization(options.org)
      console.log(`\n選択された組織: ${org.name} [現在のプラン: ${org.plan}]`)

      const newPlan = await resolvePlan(options.plan, org.plan)

      if (newPlan === org.plan) {
        console.log('プランは変更されていません。')
        process.exit(0)
      }

      await db.update(organizations)
        .set({ plan: newPlan, updatedAt: new Date() })
        .where(eq(organizations.id, org.id))

      console.log(`プランを更新しました: ${org.plan} -> ${newPlan}`)
    } catch (error) {
      console.error('Error:', error)
      process.exit(1)
    } finally {
      await client.end()
    }
  })

program.parse()
