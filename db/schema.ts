import { pgTable, uuid, varchar, text, timestamp, index, pgEnum, integer, unique, customType } from 'drizzle-orm/pg-core'

const bytea = customType<{ data: Buffer }>({
  dataType() {
    return 'bytea'
  },
})

export const roleEnum = pgEnum('role', ['admin', 'general'])
export const roundingDirectionEnum = pgEnum('rounding_direction', ['ceil', 'floor'])
export const aggregationUnitEnum = pgEnum('aggregation_unit', ['weekly', 'monthly', 'none'])
export const organizationRoleEnum = pgEnum('organization_role', ['owner', 'manager', 'worker'])
export const planEnum = pgEnum('plan', ['free', 'premium'])

export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 63 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }).notNull().default(''),
  plan: planEnum('plan').notNull().default('free'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('organizations_name_idx').on(table.name),
])

export const organizationAssignments = pgTable('organization_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: organizationRoleEnum('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  unique('organization_assignments_organization_user_unique').on(table.organizationId, table.userId),
  index('organization_assignments_organization_id_idx').on(table.organizationId),
  index('organization_assignments_user_id_idx').on(table.userId),
])

export const organizationConfigurations = pgTable('organization_configurations', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  roundingInterval: integer('rounding_interval').notNull().default(15),
  roundingDirection: roundingDirectionEnum('rounding_direction').notNull().default('ceil'),
  aggregationUnit: aggregationUnitEnum('aggregation_unit').notNull().default('monthly'),
  aggregationPeriod: integer('aggregation_period').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('projects_organization_id_idx').on(table.organizationId),
])

export const projectConfigurations = pgTable('project_configurations', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  roundingInterval: integer('rounding_interval').notNull().default(15),
  roundingDirection: roundingDirectionEnum('rounding_direction').notNull().default('ceil'),
  aggregationUnit: aggregationUnitEnum('aggregation_unit').notNull().default('monthly'),
  aggregationPeriod: integer('aggregation_period').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: varchar('email', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  role: roleEnum('role').notNull().default('general'),
  iconUrl: text('icon_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  unique('users_email_unique').on(table.email),
])

export const projectAssignments = pgTable('project_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  targetMinutes: integer('target_minutes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('project_assignments_project_id_idx').on(table.projectId),
  index('project_assignments_user_id_idx').on(table.userId),
])

export const projectActivities = pgTable('project_activities', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  startedAt: timestamp('started_at').notNull(),
  endedAt: timestamp('ended_at'),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('project_activities_started_at_idx').on(table.startedAt),
  index('project_activities_user_started_idx').on(table.userId, table.startedAt),
  index('project_activities_project_started_idx').on(table.projectId, table.startedAt),
])

export const deletedUsers = pgTable('deleted_users', {
  id: uuid('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  role: roleEnum('role').notNull(),
  iconUrl: text('icon_url'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  deletedAt: timestamp('deleted_at').defaultNow().notNull(),
  deletedBy: uuid('deleted_by').notNull(),
})

export const deletedProjectActivities = pgTable('deleted_project_activities', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  projectId: uuid('project_id').notNull(),
  startedAt: timestamp('started_at').notNull(),
  endedAt: timestamp('ended_at'),
  note: text('note'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  deletedAt: timestamp('deleted_at').defaultNow().notNull(),
  deletedBy: uuid('deleted_by').notNull(),
})

export const deletedProjectAssignments = pgTable('deleted_project_assignments', {
  id: uuid('id').primaryKey(),
  projectId: uuid('project_id').notNull(),
  userId: uuid('user_id').notNull(),
  startedAt: timestamp('started_at').notNull(),
  endedAt: timestamp('ended_at'),
  targetMinutes: integer('target_minutes'),
  createdAt: timestamp('created_at').notNull(),
  deletedAt: timestamp('deleted_at').defaultNow().notNull(),
  deletedBy: uuid('deleted_by').notNull(),
})

export const personalAccessTokens = pgTable('personal_access_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
  prefix: varchar('prefix', { length: 12 }).notNull(),
  expiresAt: timestamp('expires_at'),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('pat_token_hash_idx').on(table.tokenHash),
  index('pat_user_id_idx').on(table.userId),
  index('pat_organization_id_idx').on(table.organizationId),
])

export const projectActivityReports = pgTable('project_activity_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  publicId: varchar('public_id', { length: 21 }).notNull().unique(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  content: bytea('content'),
  mimeType: varchar('mime_type', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('project_activity_reports_public_id_idx').on(table.publicId),
  index('project_activity_reports_organization_id_idx').on(table.organizationId),
])
