import { relations } from 'drizzle-orm'
import {
  organizations,
  organizationAssignments,
  organizationConfigurations,
  projects,
  users,
  projectAssignments,
  projectActivities,
} from './schema'

export const organizationsRelations = relations(organizations, ({ many }) => ({
  organizationAssignments: many(organizationAssignments),
  projects: many(projects),
  organizationConfigurations: many(organizationConfigurations),
}))

export const organizationAssignmentsRelations = relations(organizationAssignments, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationAssignments.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [organizationAssignments.userId],
    references: [users.id],
  }),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  projectAssignments: many(projectAssignments),
  projectActivities: many(projectActivities),
}))

export const usersRelations = relations(users, ({ many }) => ({
  organizationAssignments: many(organizationAssignments),
  projectAssignments: many(projectAssignments),
  projectActivities: many(projectActivities),
}))

export const projectAssignmentsRelations = relations(projectAssignments, ({ one }) => ({
  project: one(projects, {
    fields: [projectAssignments.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectAssignments.userId],
    references: [users.id],
  }),
}))

export const projectActivitiesRelations = relations(projectActivities, ({ one }) => ({
  user: one(users, {
    fields: [projectActivities.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [projectActivities.projectId],
    references: [projects.id],
  }),
}))

export const organizationConfigurationsRelations = relations(organizationConfigurations, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationConfigurations.organizationId],
    references: [organizations.id],
  }),
}))

