import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { createClient } from '@supabase/supabase-js'
import { isWeekend } from 'date-fns'
import * as schema from '../db/schema'

const client = postgres(process.env.DATABASE_URL!, { prepare: false })
const db = drizzle(client, { schema })

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// --- 定数 ---

const SEED_USERS = [
  { name: '横山', email: 'yokoyama@example.com', password: 'password123', role: 'admin' as const },
  { name: '坂本', email: 'sakamoto@example.com', password: 'password123', role: 'admin' as const },
  { name: '政島', email: 'masajima@example.com', password: 'password123', role: 'general' as const },
]

const PROJECT_NAMES = ['Android', 'Excel', 'Neo4j', 'リファクタリング'] as const

// 日本の祝日 (2025/6 ~ 2026/3)
const HOLIDAYS = new Set([
  '2025-07-21', // 海の日
  '2025-08-11', // 山の日
  '2025-09-15', // 敬老の日
  '2025-09-23', // 秋分の日
  '2025-10-13', // スポーツの日
  '2025-11-03', // 文化の日
  '2025-11-24', // 勤労感謝の日 振替休日
  '2026-01-01', // 元日
  '2026-01-02', // 振替休日
  '2026-01-12', // 成人の日
  '2026-02-11', // 建国記念の日
  '2026-02-23', // 天皇誕生日
  '2026-03-20', // 春分の日
])

function isBusinessDay(date: Date): boolean {
  if (isWeekend(date)) return false
  const key = date.toISOString().slice(0, 10)
  return !HOLIDAYS.has(key)
}

function getBusinessDays(year: number, month: number): Date[] {
  const days: Date[] = []
  const date = new Date(year, month - 1, 1)
  while (date.getMonth() === month - 1) {
    if (isBusinessDay(date)) {
      days.push(new Date(date))
    }
    date.setDate(date.getDate() + 1)
  }
  return days
}

function makeTimestamp(date: Date, hour: number, minute = 0): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute)
}

type ActivityInsert = typeof schema.activities.$inferInsert
type AssignmentInsert = typeof schema.assignments.$inferInsert

// --- Supabase Auth ユーザー管理 ---

const SEED_EMAILS = SEED_USERS.map((u) => u.email)

async function deleteExistingSeedAuthUsers() {
  const { data, error } = await supabase.auth.admin.listUsers()
  if (error) throw new Error(`Failed to list auth users: ${error.message}`)

  const seedUsers = data.users.filter((u) => u.email && SEED_EMAILS.includes(u.email))
  for (const user of seedUsers) {
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
    if (deleteError) throw new Error(`Failed to delete auth user ${user.email}: ${deleteError.message}`)
    console.log(`  Deleted auth user: ${user.email} (${user.id})`)
  }
}

async function createAuthUser(email: string, password: string, role: 'admin' | 'general') {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role },
  })
  if (error) throw new Error(`Failed to create auth user ${email}: ${error.message}`)
  console.log(`  Created auth user: ${email} (${data.user.id})`)
  return data.user.id
}

// --- メイン ---

async function main() {
  console.log('=== Seed Start ===\n')

  // 1. Supabase Auth ユーザー削除 & 再作成
  console.log('1. Deleting existing Supabase Auth seed users...')
  await deleteExistingSeedAuthUsers()

  console.log('\n2. Creating Supabase Auth users...')
  const userIds: string[] = []
  for (const u of SEED_USERS) {
    const id = await createAuthUser(u.email, u.password, u.role)
    userIds.push(id)
  }

  // 3. DB リセット
  console.log('\n3. Resetting database...')
  await db.delete(schema.activities)
  await db.delete(schema.assignments)
  await db.delete(schema.users)
  await db.delete(schema.projects)
  console.log('  Done.')

  // 4. Users
  console.log('\n4. Inserting users...')
  const dbUsers = await db.insert(schema.users).values(
    SEED_USERS.map((u, i) => ({
      id: userIds[i],
      name: u.name,
      role: u.role,
    }))
  ).returning()
  console.log(`  Inserted ${dbUsers.length} users.`)

  const userId = {
    yokoyama: dbUsers[0].id,
    sakamoto: dbUsers[1].id,
    masajima: dbUsers[2].id,
  }

  // 5. Projects
  console.log('\n5. Inserting projects...')
  const dbProjects = await db.insert(schema.projects).values(
    PROJECT_NAMES.map((name) => ({ name }))
  ).returning()
  console.log(`  Inserted ${dbProjects.length} projects.`)

  const projectId = {
    android: dbProjects[0].id,
    excel: dbProjects[1].id,
    neo4j: dbProjects[2].id,
    refactoring: dbProjects[3].id,
  }

  // 6. Assignments
  console.log('\n6. Inserting assignments...')
  const assignmentValues = [
    // Android: 2025/6 ~ 2026/1
    { projectId: projectId.android, userId: userId.yokoyama, startedAt: new Date(2025, 5, 1), endedAt: new Date(2026, 0, 31), targetMinutes: 9600 },
    { projectId: projectId.android, userId: userId.sakamoto, startedAt: new Date(2025, 5, 1), endedAt: new Date(2026, 0, 31), targetMinutes: 9600 },
    { projectId: projectId.android, userId: userId.masajima, startedAt: new Date(2025, 5, 1), endedAt: new Date(2026, 0, 31), targetMinutes: 9600 },
    // Excel: 2026/2 ~ 2026/3
    { projectId: projectId.excel, userId: userId.yokoyama, startedAt: new Date(2026, 1, 1), endedAt: new Date(2026, 2, 31), targetMinutes: 4800 },
    { projectId: projectId.excel, userId: userId.sakamoto, startedAt: new Date(2026, 1, 1), endedAt: new Date(2026, 2, 31), targetMinutes: 4800 },
    { projectId: projectId.excel, userId: userId.masajima, startedAt: new Date(2026, 1, 1), endedAt: new Date(2026, 2, 31), targetMinutes: 9600 },
    // Neo4j: 2026/3 坂本のみ
    { projectId: projectId.neo4j, userId: userId.sakamoto, startedAt: new Date(2026, 2, 1), endedAt: new Date(2026, 2, 31), targetMinutes: 4800 },
    // リファクタリング: 2026/3 横山のみ
    { projectId: projectId.refactoring, userId: userId.yokoyama, startedAt: new Date(2026, 2, 1), endedAt: new Date(2026, 2, 31), targetMinutes: 1200 },
  ]
  const dbAssignments = await db.insert(schema.assignments).values(assignmentValues satisfies AssignmentInsert[]).returning()
  console.log(`  Inserted ${dbAssignments.length} assignments.`)

  // 7. Activities 生成
  console.log('\n7. Generating activities...')
  const activities: ActivityInsert[] = []

  // 2025/6 ~ 2025/12: 全員 160h/月 Android（フル 9-12, 13-18）
  for (let month = 6; month <= 12; month++) {
    const days = getBusinessDays(2025, month)
    for (const day of days) {
      for (const uid of [userId.yokoyama, userId.sakamoto, userId.masajima]) {
        activities.push(
          { userId: uid, projectId: projectId.android, startedAt: makeTimestamp(day, 9), endedAt: makeTimestamp(day, 12) },
          { userId: uid, projectId: projectId.android, startedAt: makeTimestamp(day, 13), endedAt: makeTimestamp(day, 18) },
        )
      }
    }
  }

  // 2026/1: Android
  // 政島: フル, 横山・坂本: 半日
  {
    const days = getBusinessDays(2026, 1)
    for (const day of days) {
      // 政島 フル
      activities.push(
        { userId: userId.masajima, projectId: projectId.android, startedAt: makeTimestamp(day, 9), endedAt: makeTimestamp(day, 12) },
        { userId: userId.masajima, projectId: projectId.android, startedAt: makeTimestamp(day, 13), endedAt: makeTimestamp(day, 18) },
      )
      // 横山・坂本 半日
      for (const uid of [userId.yokoyama, userId.sakamoto]) {
        activities.push(
          { userId: uid, projectId: projectId.android, startedAt: makeTimestamp(day, 9), endedAt: makeTimestamp(day, 13) },
        )
      }
    }
  }

  // 2026/2: Excel
  // 政島: フル, 横山・坂本: 半日
  {
    const days = getBusinessDays(2026, 2)
    for (const day of days) {
      activities.push(
        { userId: userId.masajima, projectId: projectId.excel, startedAt: makeTimestamp(day, 9), endedAt: makeTimestamp(day, 12) },
        { userId: userId.masajima, projectId: projectId.excel, startedAt: makeTimestamp(day, 13), endedAt: makeTimestamp(day, 18) },
      )
      for (const uid of [userId.yokoyama, userId.sakamoto]) {
        activities.push(
          { userId: uid, projectId: projectId.excel, startedAt: makeTimestamp(day, 9), endedAt: makeTimestamp(day, 13) },
        )
      }
    }
  }

  // 2026/3:
  // 政島: 160h Excel フル
  // 坂本: 午前 Excel + 午後 Neo4j（全営業日）
  // 横山: 午前 Excel + 午後リファクタリング（最初5営業日のみ）
  {
    const days = getBusinessDays(2026, 3)
    for (let i = 0; i < days.length; i++) {
      const day = days[i]

      // 政島 フル Excel
      activities.push(
        { userId: userId.masajima, projectId: projectId.excel, startedAt: makeTimestamp(day, 9), endedAt: makeTimestamp(day, 12) },
        { userId: userId.masajima, projectId: projectId.excel, startedAt: makeTimestamp(day, 13), endedAt: makeTimestamp(day, 18) },
      )

      // 坂本: 午前 Excel + 午後 Neo4j
      activities.push(
        { userId: userId.sakamoto, projectId: projectId.excel, startedAt: makeTimestamp(day, 9), endedAt: makeTimestamp(day, 13) },
        { userId: userId.sakamoto, projectId: projectId.neo4j, startedAt: makeTimestamp(day, 14), endedAt: makeTimestamp(day, 18) },
      )

      // 横山: 午前 Excel
      activities.push(
        { userId: userId.yokoyama, projectId: projectId.excel, startedAt: makeTimestamp(day, 9), endedAt: makeTimestamp(day, 13) },
      )

      // 横山: 午後リファクタリング（最初5営業日のみ）
      if (i < 5) {
        activities.push(
          { userId: userId.yokoyama, projectId: projectId.refactoring, startedAt: makeTimestamp(day, 14), endedAt: makeTimestamp(day, 18) },
        )
      }
    }
  }

  // 8. Activities バッチinsert
  console.log(`  Generated ${activities.length} activity records.`)
  console.log('\n7. Inserting activities...')

  const BATCH_SIZE = 500
  for (let i = 0; i < activities.length; i += BATCH_SIZE) {
    const batch = activities.slice(i, i + BATCH_SIZE)
    await db.insert(schema.activities).values(batch)
    console.log(`  Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(activities.length / BATCH_SIZE)}`)
  }

  console.log('\n=== Seed Complete ===')
  console.log(`  Users: ${dbUsers.length}`)
  console.log(`  Projects: ${dbProjects.length}`)
  console.log(`  Assignments: ${dbAssignments.length}`)
  console.log(`  Activities: ${activities.length}`)

  await client.end()
}

main().catch(async (err) => {
  console.error('Seed failed:', err)
  await client.end()
  process.exit(1)
})
