import { pgTable, uuid, varchar, text, timestamp, index, pgEnum, integer } from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['admin', 'general'])
export const roundingDirectionEnum = pgEnum('rounding_direction', ['ceil', 'floor'])
export const aggregationUnitEnum = pgEnum('aggregation_unit', ['weekly', 'monthly', 'none'])

export const configurations = pgTable('configurations', {
  id: uuid('id').defaultRandom().primaryKey(),
  roundingInterval: integer('rounding_interval').notNull().default(15),
  roundingDirection: roundingDirectionEnum('rounding_direction').notNull().default('ceil'),
  aggregationUnit: aggregationUnitEnum('aggregation_unit').notNull().default('monthly'),
  aggregationPeriod: integer('aggregation_period').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  roundingInterval: integer('rounding_interval'),
  roundingDirection: roundingDirectionEnum('rounding_direction'),
  aggregationUnit: aggregationUnitEnum('aggregation_unit'),
  aggregationPeriod: integer('aggregation_period'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  role: roleEnum('role').notNull().default('general'),
  iconUrl: text('icon_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const assignments = pgTable('assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  targetMinutes: integer('target_minutes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('assignments_project_id_idx').on(table.projectId),
  index('assignments_user_id_idx').on(table.userId),
])

export const activities = pgTable('activities', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  startedAt: timestamp('started_at').notNull(),
  endedAt: timestamp('ended_at'),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('activities_started_at_idx').on(table.startedAt),
  index('activities_user_started_idx').on(table.userId, table.startedAt),
  index('activities_project_started_idx').on(table.projectId, table.startedAt),
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

export const deletedActivities = pgTable('deleted_activities', {
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

export const deletedAssignments = pgTable('deleted_assignments', {
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
