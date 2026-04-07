import { z } from 'zod/v4'
import { OrganizationRoleSchema } from '@/schemas/organization-role'
import { PlanSchema } from '@/schemas/plan'

export const EXPORT_SCHEMA_VERSION = 1 as const

const RoundingDirectionSchema = z.enum(['ceil', 'floor'])
const AggregationUnitSchema = z.enum(['weekly', 'monthly', 'none'])

const ExportConfigurationSchema = z.object({
  roundingInterval: z.number().int(),
  roundingDirection: RoundingDirectionSchema,
  aggregationUnit: AggregationUnitSchema,
  aggregationPeriod: z.number().int(),
})

const ExportMemberSchema = z.object({
  email: z.string().email(),
  role: OrganizationRoleSchema,
})

const ExportProjectAssignmentSchema = z.object({
  memberEmail: z.string().email(),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  targetMinutes: z.number().int().nullable(),
})

const ExportProjectActivitySchema = z.object({
  memberEmail: z.string().email(),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  note: z.string().nullable(),
})

const ExportProjectSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  roundingInterval: z.number().int().nullable(),
  roundingDirection: RoundingDirectionSchema.nullable(),
  aggregationUnit: AggregationUnitSchema.nullable(),
  aggregationPeriod: z.number().int().nullable(),
  assignments: z.array(ExportProjectAssignmentSchema),
  activities: z.array(ExportProjectActivitySchema),
})

export const OrganizationExportPayloadSchema = z.object({
  schemaVersion: z.literal(EXPORT_SCHEMA_VERSION),
  exportedAt: z.string(),
  source: z.object({
    organizationId: z.string(),
    organizationName: z.string(),
  }),
  organization: z.object({
    displayName: z.string(),
    plan: PlanSchema,
  }),
  configuration: ExportConfigurationSchema,
  members: z.array(ExportMemberSchema),
  projects: z.array(ExportProjectSchema),
})

export type OrganizationExportPayload = z.infer<typeof OrganizationExportPayloadSchema>
export type ExportProject = z.infer<typeof ExportProjectSchema>
export type ExportMember = z.infer<typeof ExportMemberSchema>
