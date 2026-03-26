import { relations } from 'drizzle-orm'
import { projects, users, assignments, activities } from './schema.ts'

export const projectsRelations = relations(projects, ({ many }) => ({
  assignments: many(assignments),
}))

export const usersRelations = relations(users, ({ many }) => ({
  assignments: many(assignments),
  activities: many(activities),
}))

export const assignmentsRelations = relations(assignments, ({ one }) => ({
  project: one(projects, {
    fields: [assignments.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [assignments.userId],
    references: [users.id],
  }),
}))

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}))
