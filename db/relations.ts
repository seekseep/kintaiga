import { relations } from 'drizzle-orm'
import {
  organizations,
  organizationMembers,
  organizationConfigurations,
  projects,
  users,
  assignments,
  activities,
  reports,
  personalAccessTokens,
} from './schema'

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  projects: many(projects),
  organizationConfigurations: many(organizationConfigurations),
  reports: many(reports),
}))

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [organizationMembers.userId],
    references: [users.id],
  }),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  assignments: many(assignments),
  activities: many(activities),
}))

export const usersRelations = relations(users, ({ many }) => ({
  organizationMembers: many(organizationMembers),
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
  project: one(projects, {
    fields: [activities.projectId],
    references: [projects.id],
  }),
}))

export const organizationConfigurationsRelations = relations(organizationConfigurations, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationConfigurations.organizationId],
    references: [organizations.id],
  }),
}))

export const personalAccessTokensRelations = relations(personalAccessTokens, ({ one }) => ({
  user: one(users, {
    fields: [personalAccessTokens.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [personalAccessTokens.organizationId],
    references: [organizations.id],
  }),
}))

export const reportsRelations = relations(reports, ({ one }) => ({
  organization: one(organizations, {
    fields: [reports.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
}))
