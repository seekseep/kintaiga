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
  // seed-org & Mococo (共通メンバー)
  { name: '横山', email: 'yokoyama@example.com', password: 'password123', role: 'admin' as const },
  { name: '坂本', email: 'sakamoto@example.com', password: 'password123', role: 'admin' as const },
  { name: '政島', email: 'masajima@example.com', password: 'password123', role: 'general' as const },
  // N社
  { name: '田中', email: 'tanaka@example.com', password: 'password123', role: 'general' as const },
  { name: '木下', email: 'kinoshita@example.com', password: 'password123', role: 'general' as const },
  { name: '鈴木', email: 'suzuki@example.com', password: 'password123', role: 'general' as const },
  { name: '吉田', email: 'yoshida@example.com', password: 'password123', role: 'general' as const },
]

const PROJECT_NAMES = ['Android', 'Excel', 'Neo4j', 'リファクタリング'] as const
const NSHA_PROJECT_NAMES = ['Webサイトリニューアル', '社内ツール開発', 'データ分析基盤'] as const

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

type ActivityInsert = typeof schema.projectActivities.$inferInsert
type AssignmentInsert = typeof schema.projectAssignments.$inferInsert

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
  await db.delete(schema.projectActivities)
  await db.delete(schema.projectAssignments)
  await db.delete(schema.users)
  await db.delete(schema.projects)
  await db.delete(schema.organizationAssignments)
  await db.delete(schema.organizationConfigurations)
  await db.delete(schema.organizations)
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
    tanaka: dbUsers[3].id,
    kinoshita: dbUsers[4].id,
    suzuki: dbUsers[5].id,
    yoshida: dbUsers[6].id,
  }

  // 4.5. Organization
  console.log('\n4.5. Inserting organization...')
  const [org] = await db.insert(schema.organizations).values({
    name: 'seed-org',
  }).returning()
  console.log(`  Inserted organization: ${org.name} (${org.id})`)

  // Organization members
  await db.insert(schema.organizationAssignments).values([
    { organizationId: org.id, userId: userId.yokoyama, role: 'owner' as const },
    { organizationId: org.id, userId: userId.sakamoto, role: 'manager' as const },
    { organizationId: org.id, userId: userId.masajima, role: 'worker' as const },
  ])
  console.log('  Inserted 3 organization members.')

  // Default configuration
  await db.insert(schema.organizationConfigurations).values({
    organizationId: org.id,
  })
  console.log('  Inserted default configuration.')

  // --- Mococo 組織 ---
  console.log('\n4.6. Inserting Mococo organization...')
  const [mococoOrg] = await db.insert(schema.organizations).values({
    name: 'mococo',
    displayName: 'Mococo',
  }).returning()
  console.log(`  Inserted organization: ${mococoOrg.name} (${mococoOrg.id})`)

  await db.insert(schema.organizationAssignments).values([
    { organizationId: mococoOrg.id, userId: userId.yokoyama, role: 'owner' as const },
    { organizationId: mococoOrg.id, userId: userId.sakamoto, role: 'manager' as const },
    { organizationId: mococoOrg.id, userId: userId.masajima, role: 'worker' as const },
  ])
  console.log('  Inserted 3 Mococo members.')

  await db.insert(schema.organizationConfigurations).values({
    organizationId: mococoOrg.id,
  })

  // --- N社 組織 ---
  console.log('\n4.7. Inserting N社 organization...')
  const [nshaOrg] = await db.insert(schema.organizations).values({
    name: 'nsha',
    displayName: 'N社',
  }).returning()
  console.log(`  Inserted organization: ${nshaOrg.name} (${nshaOrg.id})`)

  await db.insert(schema.organizationAssignments).values([
    { organizationId: nshaOrg.id, userId: userId.tanaka, role: 'owner' as const },
    { organizationId: nshaOrg.id, userId: userId.kinoshita, role: 'manager' as const },
    { organizationId: nshaOrg.id, userId: userId.suzuki, role: 'worker' as const },
    { organizationId: nshaOrg.id, userId: userId.yoshida, role: 'worker' as const },
  ])
  console.log('  Inserted 4 N社 members.')

  await db.insert(schema.organizationConfigurations).values({
    organizationId: nshaOrg.id,
  })

  // 5. Projects
  console.log('\n5. Inserting projects...')
  const dbProjects = await db.insert(schema.projects).values(
    PROJECT_NAMES.map((name) => ({ name, organizationId: org.id }))
  ).returning()
  console.log(`  Inserted ${dbProjects.length} projects.`)

  const projectId = {
    android: dbProjects[0].id,
    excel: dbProjects[1].id,
    neo4j: dbProjects[2].id,
    refactoring: dbProjects[3].id,
  }

  // 5.5. N社 Projects
  console.log('\n5.5. Inserting N社 projects...')
  const nshaDbProjects = await db.insert(schema.projects).values(
    NSHA_PROJECT_NAMES.map((name) => ({ name, organizationId: nshaOrg.id }))
  ).returning()
  console.log(`  Inserted ${nshaDbProjects.length} N社 projects.`)

  const nshaProjectId = {
    web: nshaDbProjects[0].id,
    tool: nshaDbProjects[1].id,
    data: nshaDbProjects[2].id,
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
  // N社 Assignments
  const nshaAssignmentValues: AssignmentInsert[] = [
    // Webサイトリニューアル: 2025/10 ~ 2026/3 田中・木下・鈴木
    { projectId: nshaProjectId.web, userId: userId.tanaka, startedAt: new Date(2025, 9, 1), endedAt: new Date(2026, 2, 31), targetMinutes: 9600 },
    { projectId: nshaProjectId.web, userId: userId.kinoshita, startedAt: new Date(2025, 9, 1), endedAt: new Date(2026, 2, 31), targetMinutes: 9600 },
    { projectId: nshaProjectId.web, userId: userId.suzuki, startedAt: new Date(2025, 9, 1), endedAt: new Date(2026, 2, 31), targetMinutes: 4800 },
    // 社内ツール開発: 2026/1 ~ 2026/3 吉田・鈴木
    { projectId: nshaProjectId.tool, userId: userId.yoshida, startedAt: new Date(2026, 0, 1), endedAt: new Date(2026, 2, 31), targetMinutes: 7200 },
    { projectId: nshaProjectId.tool, userId: userId.suzuki, startedAt: new Date(2026, 0, 1), endedAt: new Date(2026, 2, 31), targetMinutes: 4800 },
    // データ分析基盤: 2026/2 ~ 2026/3 吉田・田中
    { projectId: nshaProjectId.data, userId: userId.yoshida, startedAt: new Date(2026, 1, 1), endedAt: new Date(2026, 2, 31), targetMinutes: 4800 },
    { projectId: nshaProjectId.data, userId: userId.tanaka, startedAt: new Date(2026, 1, 1), endedAt: new Date(2026, 2, 31), targetMinutes: 4800 },
  ]

  const allAssignmentValues = [...assignmentValues, ...nshaAssignmentValues]
  const dbAssignments = await db.insert(schema.projectAssignments).values(allAssignmentValues satisfies AssignmentInsert[]).returning()
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

  // --- N社 Activities ---
  // 2025/10 ~ 2025/12: Webサイトリニューアル 田中フル、木下フル、鈴木半日
  for (let month = 10; month <= 12; month++) {
    const days = getBusinessDays(2025, month)
    for (const day of days) {
      for (const uid of [userId.tanaka, userId.kinoshita]) {
        activities.push(
          { userId: uid, projectId: nshaProjectId.web, startedAt: makeTimestamp(day, 9), endedAt: makeTimestamp(day, 12) },
          { userId: uid, projectId: nshaProjectId.web, startedAt: makeTimestamp(day, 13), endedAt: makeTimestamp(day, 18) },
        )
      }
      activities.push(
        { userId: userId.suzuki, projectId: nshaProjectId.web, startedAt: makeTimestamp(day, 9), endedAt: makeTimestamp(day, 13) },
      )
    }
  }

  // 2026/1: Webサイトリニューアル 田中・木下半日、鈴木半日 + 社内ツール 吉田フル、鈴木午後
  {
    const days = getBusinessDays(2026, 1)
    for (const day of days) {
      for (const uid of [userId.tanaka, userId.kinoshita]) {
        activities.push(
          { userId: uid, projectId: nshaProjectId.web, startedAt: makeTimestamp(day, 9), endedAt: makeTimestamp(day, 13) },
        )
      }
      activities.push(
        { userId: userId.suzuki, projectId: nshaProjectId.web, startedAt: makeTimestamp(day, 9), endedAt: makeTimestamp(day, 12) },
        { userId: userId.suzuki, projectId: nshaProjectId.tool, startedAt: makeTimestamp(day, 13), endedAt: makeTimestamp(day, 18) },
      )
      activities.push(
        { userId: userId.yoshida, projectId: nshaProjectId.tool, startedAt: makeTimestamp(day, 9), endedAt: makeTimestamp(day, 12) },
        { userId: userId.yoshida, projectId: nshaProjectId.tool, startedAt: makeTimestamp(day, 13), endedAt: makeTimestamp(day, 18) },
      )
    }
  }

  // 2026/2: Web 田中午前、木下午前 + データ分析 田中午後、吉田午前 + 社内ツール 吉田午後、鈴木フル
  {
    const days = getBusinessDays(2026, 2)
    for (const day of days) {
      activities.push(
        { userId: userId.tanaka, projectId: nshaProjectId.web, startedAt: makeTimestamp(day, 9), endedAt: makeTimestamp(day, 13) },
        { userId: userId.tanaka, projectId: nshaProjectId.data, startedAt: makeTimestamp(day, 14), endedAt: makeTimestamp(day, 18) },
      )
      activities.push(
        { userId: userId.kinoshita, projectId: nshaProjectId.web, startedAt: makeTimestamp(day, 9), endedAt: makeTimestamp(day, 13) },
      )
      activities.push(
        { userId: userId.yoshida, projectId: nshaProjectId.data, startedAt: makeTimestamp(day, 9), endedAt: makeTimestamp(day, 13) },
        { userId: userId.yoshida, projectId: nshaProjectId.tool, startedAt: makeTimestamp(day, 14), endedAt: makeTimestamp(day, 18) },
      )
      activities.push(
        { userId: userId.suzuki, projectId: nshaProjectId.tool, startedAt: makeTimestamp(day, 9), endedAt: makeTimestamp(day, 12) },
        { userId: userId.suzuki, projectId: nshaProjectId.tool, startedAt: makeTimestamp(day, 13), endedAt: makeTimestamp(day, 18) },
      )
    }
  }

  // 2026/3: Web 田中午前、木下午前 + データ分析 田中午後、吉田午前 + 社内ツール 吉田午後、鈴木フル
  {
    const days = getBusinessDays(2026, 3)
    for (const day of days) {
      activities.push(
        { userId: userId.tanaka, projectId: nshaProjectId.web, startedAt: makeTimestamp(day, 9), endedAt: makeTimestamp(day, 13) },
        { userId: userId.tanaka, projectId: nshaProjectId.data, startedAt: makeTimestamp(day, 14), endedAt: makeTimestamp(day, 18) },
      )
      activities.push(
        { userId: userId.kinoshita, projectId: nshaProjectId.web, startedAt: makeTimestamp(day, 9), endedAt: makeTimestamp(day, 13) },
      )
      activities.push(
        { userId: userId.yoshida, projectId: nshaProjectId.data, startedAt: makeTimestamp(day, 9), endedAt: makeTimestamp(day, 13) },
        { userId: userId.yoshida, projectId: nshaProjectId.tool, startedAt: makeTimestamp(day, 14), endedAt: makeTimestamp(day, 18) },
      )
      activities.push(
        { userId: userId.suzuki, projectId: nshaProjectId.tool, startedAt: makeTimestamp(day, 9), endedAt: makeTimestamp(day, 12) },
        { userId: userId.suzuki, projectId: nshaProjectId.tool, startedAt: makeTimestamp(day, 13), endedAt: makeTimestamp(day, 18) },
      )
    }
  }

  // 8. Activities バッチinsert
  console.log(`  Generated ${activities.length} activity records.`)
  console.log('\n7. Inserting activities...')

  const BATCH_SIZE = 500
  for (let i = 0; i < activities.length; i += BATCH_SIZE) {
    const batch = activities.slice(i, i + BATCH_SIZE)
    await db.insert(schema.projectActivities).values(batch)
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
